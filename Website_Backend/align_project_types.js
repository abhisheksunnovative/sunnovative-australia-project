import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const projectTypeSchema = new mongoose.Schema({
  country: { type: String, required: true },
  projectType: { type: String, required: true },
  projectTypeLabel: { type: String },
  isActive: { type: Boolean, default: true },
  availableKw: [{ type: String }]
}, { timestamps: true });

// Prevent mongoose from overwriting existing model if run multiple times
const ProjectType = mongoose.models.ProjectType || mongoose.model('ProjectType', projectTypeSchema);

const MONGO_URI = process.env.MONGODB_URL;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');

    // 1. Clear old AU project types
    await ProjectType.deleteMany({ country: 'AU' });
    await ProjectType.deleteMany({ country: 'IN' });
    await ProjectType.deleteMany({ country: { $in: ['NZ', 'UK', 'US'] } });

    // 2. Seed AU project types (matching exactly with Order Journey)
    const auTypes = [
      { key: 'residential', label: 'Residential Solar' },
      { key: 'commercial', label: 'Commercial Solar' },
      { key: 'solar-battery', label: 'Solar + Battery' },
      { key: 'farm-rural', label: 'Farm / Rural Solar' },
      { key: 'community-strata', label: 'Community / Strata Solar' }
    ];
    for (let t of auTypes) {
       await ProjectType.findOneAndUpdate(
         { country: 'AU', projectType: t.key }, 
         { projectTypeLabel: t.label, availableKw: ['6.6','10','13.2'] }, 
         { upsert: true }
       );
    }

    // 3. Seed IN project types (matching exactly with Order Journey)
    const inTypes = [
      { key: 'residential', label: 'Residential Solar Journey' },
      { key: 'commercial', label: 'Commercial Solar Journey' }
    ];
    for (let t of inTypes) {
       await ProjectType.findOneAndUpdate(
         { country: 'IN', projectType: t.key }, 
         { projectTypeLabel: t.label, availableKw: ['3','5','10'] }, 
         { upsert: true }
       );
    }

    // 4. Seed other countries with ONLY Residential
    const otherCountries = ['NZ', 'UK', 'US'];
    for (let c of otherCountries) {
       await ProjectType.findOneAndUpdate(
         { country: c, projectType: 'residential' }, 
         { projectTypeLabel: 'Residential Solar', availableKw: ['3','5','10'] }, 
         { upsert: true }
       );
    }

    console.log('Seed completed successfully. Project Types aligned!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
