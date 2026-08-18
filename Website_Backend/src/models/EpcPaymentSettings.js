import mongoose from "mongoose";

const epcStageCustomSchema = new mongoose.Schema({
  stageKey: { type: String, required: true },
  customValue: { type: Number, required: true } // custom percentage or amount chosen by the EPC
}, { _id: false });

const epcPaymentSettingsSchema = new mongoose.Schema({
  epcId: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  country: { type: String, required: true },
  projectType: { type: String, required: true },
  signupTokenAmount: { type: Number, default: 0 }, // only used if platform tokenType is epc_scope
  stagePayments: { type: [epcStageCustomSchema], default: [] }
}, { timestamps: true });

// Compound index to guarantee uniqueness of configuration per EPC + Country + ProjectType
epcPaymentSettingsSchema.index({ epcId: 1, country: 1, projectType: 1 }, { unique: true });

export default mongoose.model("EpcPaymentSettings", epcPaymentSettingsSchema);
