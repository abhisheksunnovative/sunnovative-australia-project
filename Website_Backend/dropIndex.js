import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
  .then(() => mongoose.connection.collection('websitesettings').dropIndex('country_1'))
  .then(() => {
    console.log('Index dropped');
    process.exit(0);
  })
  .catch(e => {
    console.log("Index might not exist or another error:", e.message);
    process.exit(0);
  });
