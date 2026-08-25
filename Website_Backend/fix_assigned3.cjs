const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
  const bdeId = new mongoose.Types.ObjectId('6a734103ad26aeb78ceb3b4d');
  
  // Find all unassigned BDE leads for David (where assignedTo has David's ID string)
  const result3 = await Lead.updateMany(
    { uploadSource: 'bde_manual', assignedTo: '6a734103ad26aeb78ceb3b4d' },
    { $set: { assignedBde: bdeId, assignedTo: null } }
  );

  console.log("Updated bad assignedBde string ids:", result3.modifiedCount);
  mongoose.disconnect();
});
