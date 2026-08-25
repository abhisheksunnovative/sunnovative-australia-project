const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  // Let's directly call the controller logic
  const Lead = require('../Website_Backend/src/models/Lead.js').default;
  const bdeId = '6a734103ad26aeb78ceb3b4d';
  
  try {
    const leads = await Lead.find({ assignedBde: bdeId }).sort({ createdAt: -1 }).lean();
    console.log("Found leads from exact controller logic:", leads.length);
    console.log("Names:", leads.map(l => l.name));
  } catch (err) {
    console.error(err);
  }
  
  mongoose.disconnect();
});
