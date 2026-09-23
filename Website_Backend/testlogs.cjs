const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    const logs = await db.collection('scananalytics').find({ country: 'australia' }).sort({ createdAt: -1 }).limit(3).toArray();
    
    for (let log of logs) {
      console.log('--- SCAN LOG ---');
      console.log('Date:', log.createdAt);
      console.log('Reason:', log.fallbackReason);
      console.log('Text snippet:', log.rawText ? log.rawText.substring(0, 1500) : 'None');
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
