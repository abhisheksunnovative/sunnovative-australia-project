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
import { sendOtpEmail } from '../utils/sendOtpEmail.js';

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
    const { mobile, email, fullName, state } = req.body;
    const countryHeader = req.country || req.headers['x-country'] || 'australia';
    const isIndia = countryHeader === 'india' || countryHeader === 'IN';
    
    let identifier = '';
    let customer = null;
    let existingLead = null;

    if (isIndia) {
      identifier = mobile ? String(mobile).trim().replace(/\D/g, '') : '';
      if (!identifier || identifier.length < 8 || identifier.length > 12) {
        return res.status(400).json({ message: 'Valid mobile number enter karein' });
      }
      customer = await Customer.findOne({ mobile: identifier });
      existingLead = await Lead.findOne({ mobile: identifier }).sort({ createdAt: -1 });
    } else {
      identifier = email ? String(email).trim().toLowerCase() : '';
      if (!identifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        return res.status(400).json({ message: 'Valid email address enter karein' });
      }
      customer = await Customer.findOne({ email: identifier });
      existingLead = await Lead.findOne({ email: identifier }).sort({ createdAt: -1 });
    }

    const isNew = !customer;

    if (isNew) {
      const nameToUse = fullName?.trim() || existingLead?.name || 'Customer';
      customer = new Customer({ 
        fullName: nameToUse, 
        ...(isIndia ? { mobile: identifier } : { email: identifier }),
        state: state || existingLead?.state || 'New South Wales', 
        country: countryHeader 
      });
    }

    const otp = genOtp();
    customer.otp = otp;
    customer.otpExpiry = otpExp();
    customer.otpVerified = false;
    await customer.save();

    console.log('\n======================================================');
    console.log(`🔑 [CUSTOMER OTP GENERATED] ${isIndia ? 'Mobile' : 'Email'}: ${identifier} | OTP CODE: ${otp}`);
    console.log('======================================================\n');

    if (isIndia) {
      try {
        await sendOTP(identifier, otp);
      } catch (smsErr) {
        console.warn('[SMS GATEWAY WARNING] Live SMS failed, using console OTP:', smsErr.message);
      }
    } else {
      await sendOtpEmail(identifier, otp);
    }

    return res.json({
      success: true,
      isNewUser: isNew,
      pinSet: customer.pinSet,
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined, // Dev fallback
      message: `OTP ${identifier} par bheja gaya`,
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /api/customer/auth/verify-otp ───────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;
    const countryHeader = req.country || req.headers['x-country'] || 'australia';
    const isIndia = countryHeader === 'india' || countryHeader === 'IN';
    
    let identifier = '';
    let customer = null;
    let existingLead = null;

    if (isIndia) {
      identifier = mobile ? String(mobile).trim().replace(/\D/g, '') : '';
      if (!identifier || !otp) return res.status(400).json({ message: 'Mobile aur OTP chahiye' });
      customer = await Customer.findOne({ mobile: identifier });
      if (!customer) existingLead = await Lead.findOne({ mobile: identifier });
    } else {
      identifier = email ? String(email).trim().toLowerCase() : '';
      if (!identifier || !otp) return res.status(400).json({ message: 'Email aur OTP chahiye' });
      customer = await Customer.findOne({ email: identifier });
      if (!customer) existingLead = await Lead.findOne({ email: identifier });
    }

    if (!customer) {
      if (existingLead) {
        customer = new Customer({
          fullName: existingLead.name || 'Customer',
          mobile: isIndia ? identifier : null,
          email: !isIndia ? identifier : null,
          state: existingLead.state || 'New South Wales',
          country: existingLead.country || countryHeader
        });
        await customer.save();
      } else {
        return res.status(404).json({ message: `${isIndia ? 'Mobile' : 'Email'} registered nahi. Kripya naya form bharein.` });
      }
    }

    if (customer.otp !== String(otp).trim()) return res.status(400).json({ message: 'OTP galat hai' });
    if (customer.otpExpiry && customer.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expire ho gaya' });

    customer.otp = null;
    customer.otpExpiry = null;
    customer.otpVerified = true;
    customer.isActive = true;
    await customer.save();

    if (isIndia) {
      await Lead.updateMany({ mobile: identifier }, { hasLoggedIn: true });
    } else {
      await Lead.updateMany({ email: identifier }, { hasLoggedIn: true });
    }

    const searchQuery = isIndia ? { customerMobile: identifier } : { customerEmail: identifier };
    const existingProjects = await ProjectOrder.find(searchQuery)
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const latestLead = isIndia ? await Lead.findOne({ mobile: identifier }).sort({ createdAt: -1 }).lean() : await Lead.findOne({ email: identifier }).sort({ createdAt: -1 }).lean();

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
    const { mobile, email, pin } = req.body;
    const countryHeader = req.country || req.headers['x-country'] || 'australia';
    const isIndia = countryHeader === 'india' || countryHeader === 'IN';
    
    let identifier = isIndia ? (mobile ? String(mobile).trim().replace(/\D/g, '') : '') : (email ? String(email).trim().toLowerCase() : '');

    if (!identifier || !pin || !/^\d{4}$/.test(pin))
      return res.status(400).json({ message: '4-digit numeric PIN chahiye' });

    const customer = isIndia ? await Customer.findOne({ mobile: identifier, otpVerified: true }) : await Customer.findOne({ email: identifier, otpVerified: true });
    
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
    const { mobile, email, pin } = req.body;
    const countryHeader = req.country || req.headers['x-country'] || 'australia';
    const isIndia = countryHeader === 'india' || countryHeader === 'IN';
    
    let identifier = isIndia ? (mobile ? String(mobile).trim().replace(/\D/g, '') : '') : (email ? String(email).trim().toLowerCase() : '');
    if (!identifier || !pin) return res.status(400).json({ message: 'Identifier aur PIN chahiye' });

    const customer = isIndia ? await Customer.findOne({ mobile: identifier }) : await Customer.findOne({ email: identifier });
    
    if (!customer) return res.status(404).json({ message: 'Account registered nahi' });
    if (!customer.pinSet) return res.status(400).json({ message: 'PIN set nahi hai — OTP se login karo' });
    if (!customer.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const match = await customer.matchPin(pin);
    if (!match) return res.status(400).json({ message: 'PIN galat hai' });

    if (isIndia) {
      await Lead.updateMany({ mobile: identifier }, { hasLoggedIn: true });
    } else {
      await Lead.updateMany({ email: identifier }, { hasLoggedIn: true });
    }

    const searchQuery = isIndia ? { customerMobile: identifier } : { customerEmail: identifier };
    const existingProjects = await ProjectOrder.find(searchQuery)
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy')
      .sort({ createdAt: -1 })
      .limit(10);
      
    const latestLead = isIndia ? await Lead.findOne({ mobile: identifier }).sort({ createdAt: -1 }).lean() : await Lead.findOne({ email: identifier }).sort({ createdAt: -1 }).lean();

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
    const isIndia = customer.mobile ? true : false;
    const projectQuery = isIndia 
      ? { customerMobile: customer.mobile }
      : { customerEmail: customer.email };

    const projects = await ProjectOrder.find(projectQuery)
      .select('orderNumber projectType status createdAt systemSizeKW estimatedSubsidy completionPercentage')
      .sort({ createdAt: -1 });

    const leadQuery = isIndia
      ? { mobile: customer.mobile }
      : { email: customer.email };
      
    const latestLead = await Lead.findOne(leadQuery).sort({ createdAt: -1 }).lean();
      
    res.json({ success: true, customer: { ...customer.toObject(), latestLead }, linkedProjects: projects });
  } catch (err) {
    console.error('getMe error:', err);
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