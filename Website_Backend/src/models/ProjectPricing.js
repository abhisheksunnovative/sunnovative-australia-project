import mongoose from "mongoose";

const projectPricingSchema = new mongoose.Schema({
  country: { type: String, required: true },
  projectType: { type: String, required: true },
  systemSizeKW: { type: Number, required: true },
  solarPanel: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  inverter: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  projectPrice: { type: Number, required: true },
  estimatedSubsidy: { type: Number, default: 0 },
  pricingResponsibility: { type: String, enum: ['Company', 'EPC'], default: 'Company' },
  allowEpcToSetPrice: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  epcId: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', default: null } // If EPC sets the price
}, { timestamps: true });

export default mongoose.model("ProjectPricing", projectPricingSchema);
