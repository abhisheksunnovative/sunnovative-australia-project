const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('sunnovative-b2b');
    const collection = database.collection('billtemplates');

    const t = await collection.findOne({ discomName: 'Origin Energy' });
    if(t) {
      console.log('RULES:', t.extractionRules.map(r => r.field));
    } else {
      console.log('Template not found!');
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
