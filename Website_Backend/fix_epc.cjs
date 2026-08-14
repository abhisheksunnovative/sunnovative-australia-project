const { MongoClient } = require("mongodb");
async function run() {
  const client = new MongoClient("mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP");
  await client.connect();
  const db = client.db("test"); 
  await db.collection("epcpartners").updateMany({}, { $set: { isActive: true, isVerified: true, onboardingStatus: 'Approved' } });
  console.log("EPCs updated");
  await client.close();
}
run().catch(console.dir);
