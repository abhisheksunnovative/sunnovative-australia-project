import mongoose from "mongoose";

const DiscomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    short_code: { type: String }, // e.g. "PGVCL"
    licensee_type: { type: String, default: "public" }, 
    source_url: { type: String },
    country: { type: String, required: true, default: "India" },
    state: { type: String, required: true },
    districts: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Discom = mongoose.model("Discom", DiscomSchema);
