const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ProjectModel = require('./src/models/ProjectModel');

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sunnovative', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    const pendingProjects = await ProjectModel.find({ 
      bdeRecommendationStatus: { $in: ['recommended', 'pending'] } 
    });

    console.log(`Found ${pendingProjects.length} in-flight projects waiting for EPC acceptance via old BDE module.`);

    if (pendingProjects.length > 0) {
      console.log('Resetting these projects so customers can select their EPC via the new flow...');
      
      for (const p of pendingProjects) {
        p.bdeRecommendationStatus = undefined;
        p.recommendedEpcs = [];
        p.status = 'New';
        p.pendingActionAlert = 'Please select your preferred EPC installer from your portal.';
        await p.save();
        console.log(`Reset project ${p._id} for customer ${p.customerName}`);
      }
      console.log('Migration completed successfully.');
    } else {
      console.log('No in-flight records found. Safe to deploy.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

runMigration();
