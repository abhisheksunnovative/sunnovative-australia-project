import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  projectType: { type: String, required: true },
  projectTypeLabel: { type: String, required: true },
  availableKw: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProjectType = mongoose.model('ProjectType', schema);

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function updateAusTypes() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to DB');

    await ProjectType.deleteMany({ country: 'australia' });
    console.log('Deleted old australia types');

    const newTypes = [
      { country: 'australia', projectType: 'residential', projectTypeLabel: 'Residential Solar', availableKw: ['5','10'] },
      { country: 'australia', projectType: 'commercial', projectTypeLabel: 'Commercial Solar', availableKw: ['10','50'] },
      { country: 'australia', projectType: 'solar-battery', projectTypeLabel: 'Solar + Battery', availableKw: ['5','10'] },
      { country: 'australia', projectType: 'farm-rural', projectTypeLabel: 'Farm / Rural Solar', availableKw: ['10','50'] },
      { country: 'australia', projectType: 'community-strata', projectTypeLabel: 'Community / Strata Solar', availableKw: ['10','50'] }
    ];

    await ProjectType.insertMany(newTypes);
    console.log('Inserted updated australia types successfully!');

    mongoose.disconnect();
  } catch(err) {
    console.error(err);
    mongoose.disconnect();
  }
}

updateAusTypes();
