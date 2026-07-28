import mongoose from "mongoose";

const bdeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null }, // Optional since BDE sets it via OTP
    mobile: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    
    // Auth / OTP for first-time login or password reset
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    
    // Territories / Region Assignments
    assignedCountries: [{ type: String, trim: true }],
    assignedStates: [{ type: String, trim: true }],
    assignedDistricts: [{ type: String, trim: true }],
    assignedRegions: [{ type: String, trim: true }],
    assignedPincodes: [{ type: String, trim: true }],
    
    // Project Type assignments (e.g. 'surya-ghar', 'commercial')
    assignedProjectTypes: [{ type: String, trim: true }],

    // Monthly Targets
    targets: {
      leads: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },
    
    // Performance Cache
    performance: {
      leadsAcquired: { type: Number, default: 0 },
      leadsConverted: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const BDE = mongoose.model("BDE", bdeSchema);
