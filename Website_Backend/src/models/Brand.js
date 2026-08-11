import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  products: [{ 
    type: String, 
    enum: ['Solar Panel', 'Inverter', 'Battery'] 
  }],
  country: [{ 
    type: String, 
    lowercase: true
  }],
  logoUrl: { 
    type: String, 
    default: '' 
  },
  district: { type: String, default: 'all' },
  wattage: { type: String, default: '' },
  technology: { type: String, default: '' },
  inverterType: { type: String, default: '' },
  inverterCapacity: { type: String },
  availableKw: [{ type: String }],
  projectTypes: [{ type: String }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);
