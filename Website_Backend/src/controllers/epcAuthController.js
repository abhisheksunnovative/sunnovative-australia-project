import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import EpcPartner from '../models/EpcPartner.js';

// Fresh Token Generator
const generateToken = (id) => {
  return jwt.sign(
    { id, type: 'epc' }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

const emailOtpStore  = {};
const mobileOtpStore = {};
const QUICKKYC_KEY   = process.env.QUICKKYC_API_KEY;
const QUICKKYC_BASE  = 'https://api.quickekyc.com/api/v1';
const generateOtp    = () => String(Math.floor(100000 + Math.random() * 900000));

const sendEmailOtp = async (toEmail, otp) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender:  { name: 'Sunnovative EPC', email: process.env.BREVO_SENDER_EMAIL },
        to:      [{ email: toEmail }],
        subject: 'Your Sunnovative EPC Login OTP',
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
            <div style="text-align:center;margin-bottom:20px;">
              <h2 style="color:#1d4ed8;margin:0;">Sunnovative EPC Portal</h2>
              <p style="color:#6b7280;font-size:13px;margin-top:4px;">Solar Project Management Platform</p>
            </div>
            <p style="color:#374151;font-size:15px;">Your OTP for login/registration is:</p>
            <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
              <span style="font-size:40px;font-weight:bold;letter-spacing:16px;color:#1d4ed8;">${otp}</span>
            </div>
            <p style="color:#6b7280;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share with anyone.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">If you did not request this, please ignore.</p>
          </div>
        `,
      },
      {
        headers: {
          'api-key':      process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        timeout: 15000,
      }
    );
    console.log(`✅ Brevo API OTP sent to ${toEmail}: ${otp}`);
    return true;
  } catch (err) {
    console.error('Brevo API error:', err.response?.data || err.message);
    return false;
  }
};

export const getCompaniesByState = async (req, res) => {
  try {
    const { state, search, country } = req.query;
    if (!state) return res.status(400).json({ message: 'State required' });
    
    // Minimal query object banayein taaki matching tight na ho
    const query = {}; 

    // Country filter (default to india for backward compatibility)
    query.country = country ? { $regex: new RegExp(`^${country.trim()}$`, 'i') } : { $regex: new RegExp(`^india$`, 'i') };

    // State ko trim karke case-insensitive regex banayein
    query.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };

    // Search query ko bhi trim karke regex lagayein
    if (search && search.trim().length >= 2) {
      query.companyName = { $regex: search.trim(), $options: 'i' };
    }

    // Yeh console log Render ke logs me exact query print karega debug karne ke liye
    console.log("LOG -> Executing Query:", JSON.stringify(query));

    const companies = await EpcPartner.find(query)
      .select('companyName email mobile state district')
      .limit(10);

    res.json({ companies });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginCheck = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const epc = await EpcPartner.findOne({ email });
    if (!epc) return res.status(404).json({ message: 'No EPC account found with this email' });
    // Allow login so frontend can show the suspended banner
    // if (!epc.isActive) return res.status(403).json({ message: 'Account pending admin approval.' });

    const maskedEmail = email.replace(/(.{2}).*(@)/, '$1***$2');

    if (epc.loginPin) {
      return res.json({
        hasPinSet:   true,
        nextStep:    'ENTER_PIN',
        message:     'Enter your PIN to login.',
        companyName: epc.companyName,
        maskedEmail,
      });
    }

    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    emailOtpStore[email] = { otp, expiresAt, epcId: epc._id.toString() };

    const emailSent = await sendEmailOtp(email, otp);

    res.json({
      hasPinSet:   false,
      nextStep:    'ENTER_OTP',
      success:     true,
      message:     `OTP has been sent to ${maskedEmail}`,
      emailSent,
      companyName: epc.companyName,
      maskedEmail,
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('loginCheck error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const epc = await EpcPartner.findOne({ email });
    if (!epc) return res.status(404).json({ message: 'No EPC account found with this email' });
    // Allow login to show suspended banner
    // if (!epc.isActive) return res.status(403).json({ message: 'Account pending admin approval.' });

    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    emailOtpStore[email] = { otp, expiresAt, epcId: epc._id.toString() };

    const emailSent = await sendEmailOtp(email, otp);

    res.json({
      success:     true,
      message:     `OTP has been sent to ${email.replace(/(.{2}).*(@)/, '$1***$2')}`,
      emailSent,
      hasPinSet:   !!epc.loginPin,
      companyName: epc.companyName,
      maskedEmail: email.replace(/(.{2}).*(@)/, '$1***$2'),
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('loginSendOtp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const record = emailOtpStore[email];
    if (!record) return res.status(400).json({ message: 'OTP not sent or expired. Request again.' });
    if (Date.now() > record.expiresAt) {
      delete emailOtpStore[email];
      return res.status(400).json({ message: 'OTP expired. Request again.' });
    }
    if (record.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid OTP.' });
    delete emailOtpStore[email];

    const epc = await EpcPartner.findById(record.epcId);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    res.json({
      message:     'OTP verified successfully.',
      nextStep:    epc.loginPin ? 'ENTER_PIN' : 'SET_PIN',
      tempToken:    generateToken(epc._id), 
      companyName: epc.companyName,
    });
  } catch (err) {
    console.error('loginVerifyOtp error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginWithPin = async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) return res.status(400).json({ message: 'Email and PIN required' });
    if (pin.length !== 4) return res.status(400).json({ message: 'PIN must be 4 digits' });

    const epc = await EpcPartner.findOne({ email });
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    // Allow login to show suspended banner
    // if (!epc.isActive) return res.status(403).json({ message: 'Account pending admin approval.' });
    if (!epc.loginPin) return res.status(400).json({ message: 'PIN not set. Login with OTP first.' });

    const pinMatch = await bcrypt.compare(pin.toString(), epc.loginPin);
    if (!pinMatch) return res.status(401).json({ message: 'Invalid PIN.' });

    res.json({
      _id: epc._id, companyName: epc.companyName,
      ownerName: epc.ownerName, email: epc.email,
      mobile: epc.mobile, plan: epc.plan,
      onboardingStatus: epc.onboardingStatus,
      activeDistricts: epc.activeDistricts,
      rating: epc.rating,
      isActive: epc.isActive,
      deactivationReason: epc.deactivationReason,
      token: generateToken(epc._id),
    });
  } catch (err) {
    console.error('loginWithPin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.toString().length !== 4)
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });

    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    epc.loginPin = await bcrypt.hash(pin.toString(), await bcrypt.genSalt(10));
    await epc.save();

    const finalToken = generateToken(epc._id);

    res.json({
      message: 'PIN set successfully.',
      _id: epc._id, companyName: epc.companyName,
      ownerName: epc.ownerName, email: epc.email,
      mobile: epc.mobile, plan: epc.plan,
      onboardingStatus: epc.onboardingStatus,
      activeDistricts: epc.activeDistricts,
      rating: epc.rating,
      token: finalToken, 
    });
  } catch (err) {
    console.error('setPin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetPinSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const epc = await EpcPartner.findOne({ email });
    if (!epc) return res.status(404).json({ message: 'No account found' });

    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    emailOtpStore[`reset_${email}`] = { otp, expiresAt, epcId: epc._id.toString() };

    const emailSent = await sendEmailOtp(email, otp);

    res.json({
      success:     true,
      message:     `OTP has been sent to ${email.replace(/(.{2}).*(@)/, '$1***$2')}`,
      maskedEmail: email.replace(/(.{2}).*(@)/, '$1***$2'),
      emailSent,
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetPinVerify = async (req, res) => {
  try {
    const { email, otp, newPin } = req.body;
    if (!email || !otp || !newPin) return res.status(400).json({ message: 'All fields required' });
    if (newPin.toString().length !== 4) return res.status(400).json({ message: 'PIN must be 4 digits' });

    const record = emailOtpStore[`reset_${email}`];
    if (!record) return res.status(400).json({ message: 'OTP not sent or expired.' });
    if (Date.now() > record.expiresAt) {
      delete emailOtpStore[`reset_${email}`];
      return res.status(400).json({ message: 'OTP expired.' });
    }
    if (record.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid OTP.' });
    delete emailOtpStore[`reset_${email}`];

    const epc    = await EpcPartner.findById(record.epcId);
    epc.loginPin = await bcrypt.hash(newPin.toString(), await bcrypt.genSalt(10));
    await epc.save();

    res.json({ message: 'PIN reset successfully. Login with new PIN.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const validateGst = async (req, res) => {
  try {
    const { gstNumber } = req.body;
    if (!gstNumber) return res.status(400).json({ message: 'GST number required' });

    const gstUpper = gstNumber.toUpperCase().trim();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstUpper))
      return res.status(400).json({ message: 'Invalid GST format. Example: 24AABCU9603R1ZP' });

    const existing = await EpcPartner.findOne({ 'kycDocuments.gstNumber': gstUpper });
    if (existing) return res.status(400).json({ message: 'GST already registered. Please login.', alreadyRegistered: true });

    let gstData = null;
    try {
      const response = await axios.post(
        `${QUICKKYC_BASE}/corporate/gstin`,
        { key: QUICKKYC_KEY, id_number: gstUpper, filing_status_get: false },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      gstData = response.data;
    } catch (apiErr) {
      return res.status(apiErr.response?.status || 500).json({
        message: "GST verification failed.",
        error: apiErr.response?.data || apiErr.message
      });
    }

    if (gstData?.status !== 'success')
      return res.status(400).json({ message: gstData?.message || 'GST verification failed' });

    const d           = gstData?.data || {};
    const gstStatus   = d?.sts || 'Active';
    const companyName = d?.lgnm || d?.tradeNam || d?.business_name || '';
    const state       = d?.pradr?.addr?.stcd || '';

    if (gstStatus.toLowerCase() !== 'active')
      return res.status(400).json({ message: `GST is ${gstStatus}. Only Active GST allowed.` });

    res.json({
      valid: true, gstNumber: gstUpper,
      companyName, state,
      pan: d?.panNo || gstUpper.slice(2, 12),
      status: gstStatus,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const validateMobile = async (req, res) => {
  try {
    const { gstNumber, mobile } = req.body;
    if (!gstNumber || !mobile) return res.status(400).json({ message: 'GST and mobile required' });

    const mobileExists = await EpcPartner.findOne({ mobile });
    if (mobileExists) return res.status(400).json({ message: 'Mobile already registered' });

    const otp       = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    mobileOtpStore[mobile] = { otp, expiresAt, gstNumber: gstNumber.toUpperCase() };

    let smsSent = false;
    if (process.env.FAST2SMS_KEY) {
      try {
        const smsResponse = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: process.env.FAST2SMS_KEY,
            route:         'q',
            message:       `Your Sunnovative EPC OTP is ${otp}. Valid for 10 minutes. Do not share.`,
            numbers:       mobile,
            flash:         0,
          },
          timeout: 10000,
        });
        smsSent = smsResponse.data?.return === true;
      } catch (e) {
        console.error('SMS error:', e.response?.data || e.message);
      }
    }

    // 🔴 FAST2SMS RECHARGE FAIL FALLBACK: SMS na jaane par testing bypass karega 
    res.json({
      valid: true,
      message: smsSent ? `OTP has been sent to ${mobile.slice(0,3)}XXXXXXX` : `OTP generated (Use: ${otp})`,
      smsSent,
      otp: otp, // Frontend popup me seedhe display hoga testing ke liye
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const verifyMobileOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ message: 'Mobile and OTP required' });

    const record = mobileOtpStore[mobile];
    if (!record) return res.status(400).json({ message: 'OTP expired or not sent.' });
    if (Date.now() > record.expiresAt) {
      delete mobileOtpStore[mobile];
      return res.status(400).json({ message: 'OTP expired.' });
    }
    if (record.otp !== otp.toString()) return res.status(400).json({ message: 'Invalid OTP.' });
    delete mobileOtpStore[mobile];

    res.json({ valid: true, message: 'Mobile verified.', mobile, gstNumber: record.gstNumber });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const registerEpc = async (req, res) => {
  try {
    const { companyName, ownerName, email, mobile, state, district, city, pincode, address, yearsOfExperience, gstNumber } = req.body;

    if (!companyName || !ownerName || !email || !mobile)
      return res.status(400).json({ message: 'Please fill all required fields' });

    if (await EpcPartner.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    if (await EpcPartner.findOne({ mobile })) return res.status(400).json({ message: 'Mobile already registered' });
    if (gstNumber && await EpcPartner.findOne({ 'kycDocuments.gstNumber': gstNumber.toUpperCase() }))
      return res.status(400).json({ message: 'GST already registered' });

    const exp  = Number(yearsOfExperience) || 0;
    const plan = exp >= 5 ? 'Enterprise' : exp >= 2 ? 'Professional' : 'Standard';

    const epc = await EpcPartner.create({
      companyName, ownerName, email, mobile,
      state, district, city, pincode, address,
      yearsOfExperience: exp, plan,
      activeDistricts: district ? [district] : [],
      country: req.country || 'india',
      onboardingStatus: 'Pending',
      isActive: true,
      kycDocuments: gstNumber ? { gstNumber: gstNumber.toUpperCase() } : {},
    });

    res.status(201).json({
      message: 'Registration successful. Set your PIN to continue.',
      nextStep: 'SET_PIN',
      tempToken: generateToken(epc._id),
      epc: { _id: epc._id, companyName: epc.companyName, email: epc.email, mobile: epc.mobile, plan: epc.plan },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getEpcProfile = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id).select('-password -loginPin');
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    res.json(epc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const applyTrustBadge = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    if (epc.trustBadge?.status === 'Pending') {
      return res.status(400).json({ message: 'Application already pending' });
    }
    
    epc.trustBadge = {
      status: 'Pending',
      documentUrl: req.body.documentUrl || '',
      appliedAt: new Date()
    };
    await epc.save();
    res.json({ message: 'Trust Badge applied successfully', trustBadge: epc.trustBadge });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateEpcProfile = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    ['companyName','ownerName','mobile','state','city','pincode','address']
      .forEach(f => { if (req.body[f] !== undefined) epc[f] = req.body[f]; });
    const updated = await epc.save();
    res.json({ _id: updated._id, companyName: updated.companyName, email: updated.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};