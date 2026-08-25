import mongoose from "mongoose";

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL);
    console.log("Connected.");
    
    // We don't need the full schema just to delete
    const leadSchema = new mongoose.Schema({}, { strict: false });
    const Lead = mongoose.model("Lead", leadSchema);
    
    const res = await Lead.deleteMany({ status: 'Converted' });
    console.log(`Deleted ${res.deletedCount} converted/approved leads from the database.`);
    
    await mongoose.disconnect();
  } catch(err) {
    console.error(err);
  }
};

run();
