import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CustomerSchema = new mongoose.Schema({
  fullName:    { type: String, required: true, trim: true },
  mobile:      { type: String, required: true, unique: true, trim: true },
  email:       { type: String, default: '', lowercase: true, trim: true },
  country:     { type: String, default: 'india', trim: true },
  state:       { type: String, default: 'Gujarat' },
  city:        { type: String, default: '' },
  pincode:     { type: String, default: '' },
  address:     { type: String, default: '' },

  // OTP auth
  otp:         { type: String, default: null },
  otpExpiry:   { type: Date, default: null },
  otpVerified: { type: Boolean, default: false },

  // 4-digit PIN login (like EPC panel)
  loginPin:    { type: String, default: null },  // hashed
  pinSet:      { type: Boolean, default: false },

  isActive:    { type: Boolean, default: true },

  documents: [{
    type:       { type: String },
    url:        { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Hash PIN before save
CustomerSchema.pre('save', async function () {
  if (this.isModified('loginPin') && this.loginPin && this.loginPin.length <= 6) {
    const salt = await bcrypt.genSalt(10);
    this.loginPin = await bcrypt.hash(this.loginPin, salt);
    this.pinSet = true;
  }
});

CustomerSchema.methods.matchPin = async function (enteredPin) {
  if (!this.loginPin) return false;
  return bcrypt.compare(enteredPin, this.loginPin);
};

export default mongoose.model('Customer', CustomerSchema);