const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    const t = await db.collection('billtemplates').findOne({ discomName: 'Origin Energy' });
    console.log('isActive:', t.isActive);
    console.log('status:', t.status);
    console.log('country:', t.country);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
