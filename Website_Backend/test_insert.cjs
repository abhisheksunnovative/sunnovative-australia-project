const mongoose = require('mongoose');
const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  const Lead = require('../Website_Backend/src/models/Lead.js').default;
  
  const leads = [
    {
      name: 'Test New Lead 1',
      mobile: '+61-999888771', // Unique
      whatsapp: '+61-999888771',
      solarType: 'residential',
      country: 'Australia',
      uploadSource: 'bde_manual',
      assignedBde: '6a734103ad26aeb78ceb3b4d',
      history: [{ action: 'Manually created by BDE (Bulk Upload)' }]
    }
  ];

  try {
    console.log("Attempting insert...");
    const inserted = await Lead.insertMany(leads, { ordered: false });
    console.log("Success:", inserted.length);
  } catch (err) {
    console.error("BulkWriteError test:", err);
  }

  mongoose.disconnect();
});
