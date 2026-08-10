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
    const cleanMobile = mobile ? String(mobile).trim().replace(/\D/g, '') : '';
    
    if (!cleanMobile || cleanMobile.length < 8 || cleanMobile.length > 12) {
      return res.status(400).json({ message: 'Valid mobile number enter karein' });
    }

    let customer = await Customer.findOne({ mobile: cleanMobile });
    
    // Check if customer exists in Lead collection
    const existingLead = await Lead.findOne({ mobile: cleanMobile }).sort({ createdAt: -1 });

    const isNew = !customer;

    if (isNew) {
      const nameToUse = fullName?.trim() || existingLead?.name || 'Customer';
      customer = new Customer({ 
        fullName: nameToUse, 
        mobile: cleanMobile, 
        state: state || existingLead?.state || 'New South Wales', 
        country: req.country || existingLead?.country || 'australia' 
      });
    }

    const otp = genOtp();
    customer.otp = otp;
    customer.otpExpiry = otpExp();
    customer.otpVerified = false;
    await customer.save();

    // 🔑 ALWAYS LOG OTP CLEARLY IN BACKEND SERVER CONSOLE 🔑
    console.log('\n======================================================');
    console.log(`🔑 [CUSTOMER OTP GENERATED] Mobile: ${cleanMobile} | OTP CODE: ${otp}`);
    console.log('======================================================\n');

    try {
      await sendOTP(cleanMobile, otp);
    } catch (smsErr) {
      console.warn('[SMS GATEWAY WARNING] Live SMS failed, using console OTP:', smsErr.message);
    }

    return res.json({
      success: true,
      isNewUser: isNew,
      pinSet: customer.pinSet,
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined, // Dev fallback
      message: `OTP ${cleanMobile} par bheja gaya`,
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/customer/auth/verify-otp ───────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const cleanMobile = mobile ? String(mobile).trim().replace(/\D/g, '') : '';

    if (!cleanMobile || !otp) return res.status(400).json({ message: 'Mobile aur OTP chahiye' });

    let customer = await Customer.findOne({ mobile: cleanMobile });
    
    // Fallback: If customer is in Lead table, auto-create customer record
    if (!customer) {
      const existingLead = await Lead.findOne({ mobile: cleanMobile });
      if (existingLead) {
        customer = new Customer({
          fullName: existingLead.name || 'Customer',
          mobile: cleanMobile,
          state: existingLead.state || 'New South Wales',
          country: existingLead.country || 'australia'
        });
        await customer.save();
      } else {
        return res.status(404).json({ message: 'Mobile registered nahi. Kripya naya form bharein.' });
      }
    }

    if (customer.otp !== String(otp).trim()) return res.status(400).json({ message: 'OTP galat hai' });
    if (customer.otpExpiry && customer.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expire ho gaya' });

    customer.otp = null;
    customer.otpExpiry = null;
    customer.otpVerified = true;
    customer.isActive = true;
    await customer.save();

    // Mark lead as logged in so BDE can now "Contact" them
    await Lead.updateMany({ mobile: cleanMobile }, { hasLoggedIn: true });

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

    // Mark lead as logged in so BDE can now "Contact" them
    await Lead.updateMany({ mobile }, { hasLoggedIn: true });

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