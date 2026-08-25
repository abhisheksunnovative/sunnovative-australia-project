const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const leads = await Lead.find({ createdAt: { $gte: today } }).sort({ createdAt: -1 });
  console.log("Leads uploaded today:", leads.length);
  if (leads.length > 0) {
    console.log("Most recent lead:");
    console.log("Name:", leads[0].name);
    console.log("AssignedBDE:", leads[0].assignedBde);
    console.log("History:", leads[0].history);
    console.log("CreatedAt:", leads[0].createdAt);
  }
  
  mongoose.disconnect();
});
