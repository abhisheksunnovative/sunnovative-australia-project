const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('test');
  
  const result = await db.collection('leads').updateMany(
    { name: /CHETAN/i }, 
    { $set: { billUrl: '/uploads/sample.pdf' } }
  );
  
  console.log(`Updated ${result.modifiedCount} leads for CHETAN.`);
  await client.close();
}

run().catch(console.error);
