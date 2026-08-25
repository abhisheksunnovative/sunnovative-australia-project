const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  const BDE = mongoose.model("BDE", new mongoose.Schema({}, { strict: false, collection: 'bdes' }));
  const bde = await BDE.findOne({ email: 'david@test.com.au' });
  
  if (bde) {
    const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
    const result = await Lead.updateMany(
      { name: { $in: ['James Wilson', 'Sarah Thompson', 'Michael Chen', 'Emma Rodriguez', 'David Nguyen'] } }, 
      { $set: { assignedTo: bde._id } }
    );
    console.log("Updated specific leads:", result.modifiedCount);
  }
  
  mongoose.disconnect();
});
