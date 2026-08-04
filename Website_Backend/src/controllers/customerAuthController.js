/**
 * customerAuthController.js
 * Flow:
 *   New user  → sendOtp → verifyOtp → setPin → JWT
 *   Old user  → loginWithPin (fast) OR sendOtp → verifyOtp → JWT
 *   Lead user → on verifyOtp, auto-fetch their existing projects from ProjectOrder
 */

import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import {ProjectOrder} from '../models/ProjectModel.js';
import Lead from '../models/Lead.js';
import { sendOTP } from '../utils/smsService.js';

// ── helpers ───────────────────────────────────────────────────────────────────
const genOtp  = () => String(Math.floor(100000 + Math.random() * 900000));
const otpExp  = () => new Date(Date.now() + 10 * 60 * 1000);
const genTok  = (id) => jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });

const safeCustomer = (c) => ({
  _id: c._id, fullName: c.fullName, mobile: c.mobile,
  email: c.email, state: c.state, city: c.city,
  pinSet: c.pinSet, createdAt: c.createdAt,
});

// ── POST /api/customer/auth/send-otp ─────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { mobile, fullName, state } = req.body;
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile))
      return res.status(400).json({ message: 'Valid 10-digit mobile number daalo' });

    let customer = await Customer.findOne({ mobile });
    const isNew = !customer;

    if (isNew) {
      if (!fullName?.trim()) {
        return res.status(200).json({ message: 'Pehli baar aa rahe ho — naam daalo', isNewUser: true });
      }
      customer = new Customer({ 
        fullName: fullName.trim(), 
        mobile, 
        state: state || 'Gujarat', 
        country: req.country || 'india' 
      });
    }

    const otp = genOtp();
    customer.otp = otp;
    customer.otpExpiry = otpExp();
    customer.otpVerified = false;
    await customer.save();

    try {
      await sendOTP(mobile, otp);
    } catch (smsErr) {
      return res.status(500).json({ 
        success: false, 
        message: 'YourBulkSMS API Error: ' + smsErr.message 
      });
    }

    return res.json({
      success: true,
      isNewUser: isNew,
      pinSet: customer.pinSet,
      message: `OTP ${mobile} par bheja gaya`,
      // DEV only — remove in prod
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('sendOtp:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/customer/auth/verify-otp ───────────────────────────────────────
// After verify: if isNew → client should call /set-pin
// If existing → JWT returned directly (or client can redirect to PIN login)
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ message: 'Mobile aur OTP chahiye' });

    const customer = await Customer.findOne({ mobile });
    if (!customer) return res.status(404).json({ message: 'Mobile registered nahi' });
    if (customer.otp !== otp) return res.status(400).json({ message: 'OTP galat hai' });
    if (customer.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expire ho gaya' });

    customer.otp = null;
    customer.otpExpiry = null;
    customer.otpVerified = true;
    customer.isActive = true;
    await customer.save();

    // Check if this mobile had submitted leads before (lead form se)
    const existingProjects = await ProjectOrder.find({ customerMobile: mobile })
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const latestLead = await Lead.findOne({ mobile }).sort({ createdAt: -1 }).lean();

    const token = genTok(customer._id);

    return res.json({
      success: true,
      token,
      isNewUser: !customer.pinSet,  // → show PIN setup screen
      customer: { ...safeCustomer(customer), latestLead },
      existingLeads: existingProjects,  // auto-linked lead projects
      hasLeads: existingProjects.length > 0,
    });
  } catch (err) {
    console.error('verifyOtp:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/customer/auth/set-pin ──────────────────────────────────────────
export const setPin = async (req, res) => {
  try {
    const { mobile, pin } = req.body;
    if (!mobile || !pin || !/^\d{4}$/.test(pin))
      return res.status(400).json({ message: '4-digit numeric PIN chahiye' });

    const customer = await Customer.findOne({ mobile, otpVerified: true });
    if (!customer) return res.status(400).json({ message: 'OTP verify karo pehle' });

    customer.loginPin = pin;  // pre-save hook hashes it
    customer.otpVerified = false;
    await customer.save();

    const token = genTok(customer._id);
    return res.json({ success: true, token, customer: safeCustomer(customer), message: 'PIN set! Login ho gaye.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/customer/auth/login-with-pin ───────────────────────────────────
export const loginWithPin = async (req, res) => {
  try {
    const { mobile, pin } = req.body;
    if (!mobile || !pin) return res.status(400).json({ message: 'Mobile aur PIN chahiye' });

    const customer = await Customer.findOne({ mobile });
    if (!customer) return res.status(404).json({ message: 'Mobile registered nahi' });
    if (!customer.pinSet) return res.status(400).json({ message: 'PIN set nahi hai — OTP se login karo' });
    if (!customer.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const match = await customer.matchPin(pin);
    if (!match) return res.status(400).json({ message: 'PIN galat hai' });

    // Fetch lead projects
    const existingProjects = await ProjectOrder.find({ customerMobile: mobile })
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const latestLead = await Lead.findOne({ mobile }).sort({ createdAt: -1 }).lean();

    const token = genTok(customer._id);
    return res.json({
      success: true,
      token,
      customer: { ...safeCustomer(customer), latestLead },
      existingLeads: existingProjects,
      hasLeads: existingProjects.length > 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/customer/auth/me ─────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select('-otp -otpExpiry -loginPin');
    if (!customer) return res.status(404).json({ message: 'Not found' });
    const projects = await ProjectOrder.find({ customerMobile: customer.mobile })
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy completionPercentage')
      .sort({ createdAt: -1 });
      
    const latestLead = await Lead.findOne({ mobile: customer.mobile }).sort({ createdAt: -1 }).lean();
      
    res.json({ success: true, customer: { ...customer.toObject(), latestLead }, linkedProjects: projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PUT /api/customer/auth/profile ────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, state, city, pincode, address } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer._id,
      { fullName, email, state, city, pincode, address },
      { new: true, runValidators: false }
    ).select('-otp -otpExpiry -loginPin');
    res.json({ success: true, message: 'Profile updated!', customer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};