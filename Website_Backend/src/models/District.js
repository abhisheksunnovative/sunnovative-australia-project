import mongoose from "mongoose";
const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  district: { type: String, required: true },
  pincodes: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("District", schema);
