import mongoose from 'mongoose';

const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const projectPricings = db.collection('projectpricings');
    
    // Find a 5kW package for Australia
    const template = await projectPricings.findOne({ country: 'australia', systemSizeKW: 5, projectType: "residential-solar" });
    
    if (template) {
      // Create a 3kW package based on the 5kW one
      delete template._id;
      template.systemSizeKW = 3;
      template.estimatedSubsidy = 760; // Estimated STC for 3kW
      template.projectPrice = template.projectPrice * 0.6; // Roughly scale down price
      template.createdAt = new Date();
      template.updatedAt = new Date();
      
      await projectPricings.insertOne(template);
      console.log('Successfully added 3 kW package to Australia Residential Solar!');
    } else {
      console.log('Could not find a 5kW template to duplicate.');
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
