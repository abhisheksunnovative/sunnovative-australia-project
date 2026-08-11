import mongoose from "mongoose";

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  projectType: { type: String, required: true }, // refers to canonical projectType key
  productCategory: { type: String, required: true }, // e.g. "Solar Panel", "Inverter", "Battery"
  techSpec: { type: String }, // e.g. "Monocrystalline", "String Inverter"
  capacity: { type: String }, // e.g. "500W", "5kW"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("ProductConfig", schema);
