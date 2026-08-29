const mongoose = require('mongoose');
mongoose.connect('mongodb://ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/sunnovative?ssl=true&replicaSet=atlas-2y4vcc-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
  user: 'admin', pass: 'p2vWqgY99M8yYI21'
}).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('bdes').updateMany(
    {},
    { $pull: { assignedProjectTypes: 'residential' } }
  );
  console.log('Updated', result.modifiedCount, 'BDEs');
  process.exit(0);
}).catch(console.error);
