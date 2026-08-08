import mongoose from 'mongoose';

const EpcBulkLeadSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPersonName: { type: String },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  
  country: { type: String, required: true },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  pincode: { type: String },
  address: { type: String },
  
  gstNumber: { type: String },
  licenseNumber: { type: String },
  companyType: { type: String },
  yearsOfExperience: { type: Number },
  installationCapacityKw: { type: Number },
  monthlyCapacity: { type: Number },
  website: { type: String },
  
  projectTypes: [{ type: String }],
  serviceAreas: [{ type: String }],
  
  // To store any dynamically configured fields that aren't hardcoded above
  additionalData: { type: Map, of: mongoose.Schema.Types.Mixed },
  
  status: { type: String, enum: ['Pending', 'Active', 'Duplicate'], default: 'Pending' },
  claimedByEpcId: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', default: null }
}, { timestamps: true });

export default mongoose.model('EpcBulkLead', EpcBulkLeadSchema);
