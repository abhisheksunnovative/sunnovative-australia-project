import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const epcTeamMemberSchema = new mongoose.Schema({
  epcPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true, trim: true },
  mobile:   { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Manager', 'Installer', 'SalesAgent', 'Support'],
    default: 'Installer',
  },
  assignedDistricts:    [{ type: String }],
  assignedProjectTypes: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

epcTeamMemberSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

epcTeamMemberSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

export default mongoose.model('EpcTeamMember', epcTeamMemberSchema);