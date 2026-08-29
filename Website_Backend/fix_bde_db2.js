import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('bdes').updateMany(
    {},
    { $pull: { assignedProjectTypes: 'residential' } }
  );
  console.log('Updated', result.modifiedCount, 'BDEs');
  process.exit(0);
}).catch(console.error);
