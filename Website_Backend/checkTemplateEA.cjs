const { MongoClient } = require('mongodb');
async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const t = await db.collection('billtemplates').findOne({ discomName: 'EnergyAustralia' });
    if(t) {
      console.log('EnergyAustralia quarterlyKwh Rule:', JSON.stringify(t.extractionRules.find(r => r.field === 'quarterlyKwh'), null, 2));
    } else {
      console.log('Template not found');
    }
  } finally {
    await client.close();
  }
}
main().catch(console.error);
