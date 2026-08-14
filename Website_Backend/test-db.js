import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const docs = await mongoose.connection.db.collection(c.name).find({}).toArray();
    for (const d of docs) {
      if (JSON.stringify(d).includes("Industrial Solar")) {
        console.log(`Found in collection ${c.name}, ID: ${d._id}`);
      }
    }
  }
  console.log("Done");
  process.exit();
}).catch(console.error);
