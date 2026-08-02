import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['Solar', 'Inverter', 'Battery'] 
  },
  country: { 
    type: String, 
    default: 'australia',
    lowercase: true
  },
  logoUrl: { 
    type: String, 
    default: '' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);
