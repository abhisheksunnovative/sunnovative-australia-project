const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('test');
    // Mongoose by default connects to the DB specified in the URI, but wait, the URI doesn't specify a DB name!
    // It's probably `test` or `sunnovative-b2b`?
    // Let's list collections in `test` first.
    const cols = await database.listCollections().toArray();
    console.log('Collections in test:', cols.map(c => c.name));
    
    // Let's try sunnovative-erp
    const db2 = client.db('sunnovative-erp');
    const cols2 = await db2.listCollections().toArray();
    console.log('Collections in sunnovative-erp:', cols2.map(c => c.name));

    // Let's just find the db that has `billtemplates`
    const dbs = await client.db().admin().listDatabases();
    for (let dbInfo of dbs.databases) {
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      const colNames = collections.map(c => c.name);
      if (colNames.includes('billtemplates')) {
        console.log(`Found billtemplates in ${dbInfo.name}`);
        const t = await db.collection('billtemplates').findOne({ discomName: 'Origin Energy' });
        console.log('Origin Rules:', JSON.stringify(t.extractionRules, null, 2));
      }
    }
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
