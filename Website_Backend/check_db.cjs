const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
  const leads = await Lead.find({ uploadSource: 'bde_manual' }).sort({ createdAt: -1 }).limit(10);
  console.log(leads.map(l => ({ 
    name: l.name, 
    mobile: l.mobile, 
    history: l.history[0]?.action,
    createdAt: l.createdAt
  })));
  mongoose.disconnect();
});
