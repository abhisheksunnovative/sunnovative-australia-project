import mongoose from "mongoose";

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  projectType: { type: String, required: true }, // e.g. "residential" (canonical key)
  projectTypeLabel: { type: String, required: true }, // e.g. "Residential Solar"
  availableKw: [{ type: String }], // e.g. ["1", "2", "3", "5"]
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("ProjectType", schema);
