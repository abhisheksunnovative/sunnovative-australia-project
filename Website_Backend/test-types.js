import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const types = await mongoose.connection.db.collection("projecttypes").find({ country: "australia" }).toArray();
  console.log(`Found ${types.length} project types for Australia:`);
  types.forEach(t => console.log(`- ${t.projectTypeLabel} (${t.projectType})`));
  process.exit();
}).catch(console.error);
