import mongoose from 'mongoose';

const uri = "mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.collections();
    
    for (let c of collections) {
      if (c.collectionName === 'customers') {
        console.log('Found customers collection');
        const indexes = await c.indexes();
        console.log('Current indexes:', indexes);
        
        for (let idx of indexes) {
          if (idx.name === 'mobile_1' || idx.name === 'email_1') {
            console.log('Dropping index:', idx.name);
            await c.dropIndex(idx.name);
          }
        }
      }
    }
    
    console.log('Indexes dropped successfully');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
