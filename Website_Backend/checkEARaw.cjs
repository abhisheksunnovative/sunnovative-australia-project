const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('test');
    // Find the scan analytics for EnergyAustralia (billAmount: 9167.22)
    const log = await db.collection('scananalytics').findOne({ "rawText": { $regex: /9167\.22/ } }, { sort: { createdAt: -1 } });
    if(log) {
      console.log('RAW TEXT SNIPPET:');
      console.log(log.rawText.substring(0, 1000));
      console.log('...');
      // Look for kWh mentions
      const kwhMatches = [...log.rawText.matchAll(/.{0,50}kWh.{0,50}/gi)];
      console.log('kWh Contexts:');
      kwhMatches.forEach(m => console.log(m[0].trim().replace(/\n/g, '\\n')));
    } else {
      console.log('Log not found');
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
