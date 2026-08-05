import mongoose from "mongoose";

const bdeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null }, // Optional since BDE sets it via OTP
    mobile: { type: String, required: true, trim: true },
    country: { type: String, trim: true, default: 'india' },
    region: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    
    bdeType: { type: String, enum: ['Employee', 'Freelancer'], default: 'Employee' },

    // Freelancer Settings
    freelancerSettings: {
      commissionType: { type: String, enum: ['Fixed', 'Percentage', 'PerKW', 'Per KW'], default: 'Fixed' },
      commissionAmount: { type: Number, default: 0 },
      projectTypeCommissions: [{
        projectType: { type: String },
        amount: { type: Number, default: 0 }
      }],
      totalEarnings: { type: Number, default: 0 },
      totalPaid: { type: Number, default: 0 }
    },

    // Employee Settings
    employeeSettings: {
      employeeId: { type: String, default: '' },
      department: { type: String, default: 'Sales' }
    },
    
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
