const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const result = await db.collection('billtemplates').updateMany({}, { $set: { status: 'pending_review', isActive: false, engineVersion: 'v2.3_invalidate' } });
    console.log(`Deactivated ${result.modifiedCount} old templates`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
