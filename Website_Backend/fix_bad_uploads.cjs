const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

const csvData = [
  { mobile: '+61-412345678', name: 'James Wilson' },
  { mobile: '+61-423456789', name: 'Sarah Thompson' },
  { mobile: '+61-434567890', name: 'Michael Chen' },
  { mobile: '+61-445678901', name: 'Emma Rodriguez' },
  { mobile: '+61-456789012', name: 'David Nguyen' }
];

mongoose.connect(MONGODB_URL).then(async () => {
  const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
  
  for (const d of csvData) {
    await Lead.updateMany(
      { mobile: d.mobile }, 
      { 
        $set: { name: d.name, "history.0.action": "Manually created by BDE (Bulk Upload)" } 
      }
    );
  }
  
  console.log("Fixed the bad uploads in DB!");
  mongoose.disconnect();
});
