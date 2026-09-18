import mongoose from 'mongoose';

const URI = 'mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP';

async function buildIndexes() {
  try {
    console.log('Connecting to DB to build indexes...');
    await mongoose.connect(URI);
    const db = mongoose.connection.db;

    console.log('Building indexes for Leads...');
    await db.collection('leads').createIndex({ status: 1 });
    await db.collection('leads').createIndex({ uploadSource: 1 });
    await db.collection('leads').createIndex({ country: 1, state: 1, district: 1 });
    await db.collection('leads').createIndex({ assignedBde: 1 });
    await db.collection('leads').createIndex({ createdAt: -1 });

    console.log('Building indexes for ProjectOrders...');
    await db.collection('projectorders').createIndex({ status: 1 });
    await db.collection('projectorders').createIndex({ customerId: 1 });
    await db.collection('projectorders').createIndex({ epcId: 1 });
    await db.collection('projectorders').createIndex({ bdeId: 1 });
    await db.collection('projectorders').createIndex({ createdAt: -1 });

    console.log('Building indexes for Customers...');
    await db.collection('customers').createIndex({ email: 1 });
    await db.collection('customers').createIndex({ phone: 1 });

    console.log('Building indexes for Notifications...');
    await db.collection('notifications').createIndex({ recipientId: 1, isRead: 1 });
    await db.collection('notifications').createIndex({ role: 1, isRead: 1 });

    console.log('All indexes built successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error building indexes:', err);
    process.exit(1);
  }
}

buildIndexes();
