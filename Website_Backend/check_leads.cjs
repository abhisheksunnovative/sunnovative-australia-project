const mongoose = require('mongoose');

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    const Lead = mongoose.model("Lead", new mongoose.Schema({}, { strict: false }));
    const recentLeads = await Lead.find({ uploadSource: 'bde_manual' }).sort({ createdAt: -1 }).limit(5);
    console.log("Recent bulk leads:", recentLeads.map(l => ({ name: l.name, mobile: l.mobile, history: l.history })));
    mongoose.disconnect();
  } catch(e) { console.error(e); }
};
run();
