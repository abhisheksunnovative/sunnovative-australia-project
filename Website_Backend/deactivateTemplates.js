import mongoose from 'mongoose';

const MONGODB_URL = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

mongoose.connect(MONGODB_URL).then(async () => {
  console.log("Connected to MongoDB.");
  const db = mongoose.connection.db;
  
  // Update Horizon Power template to isActive: false
  const result = await db.collection('billtemplates').updateMany(
    { discomName: "Horizon Power" },
    { $set: { isActive: false } }
  );
  console.log(`Deactivated ${result.modifiedCount} Horizon Power templates.`);
  
  const result2 = await db.collection('billtemplates').updateMany(
    { discomName: "AGL Energy" },
    { $set: { isActive: false } }
  );
  console.log(`Deactivated ${result2.modifiedCount} AGL Energy templates.`);
  
  const result3 = await db.collection('billtemplates').updateMany(
    { discomName: "Synergy" },
    { $set: { isActive: false } }
  );
  console.log(`Deactivated ${result3.modifiedCount} Synergy templates.`);

  process.exit(0);
}).catch(err => {
  console.error("DB connection error", err);
  process.exit(1);
});
