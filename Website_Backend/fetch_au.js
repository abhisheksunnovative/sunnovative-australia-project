import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URL;

mongoose.connect(uri)
  .then(async () => {
    try {
      const db = mongoose.connection.db;
      const doc = await db.collection('eligibilitysettings').findOne({ country: 'australia' });
      if (doc) {
        console.log(JSON.stringify({
          billToKwRanges: doc.eligibilityRules?.billToKwRanges,
          kwDerivationRules: doc.eligibilityRules?.kwDerivationRules
        }, null, 2));
      } else {
        console.log("No specific document for 'australia'.");
      }
    } catch(e) {
      console.error(e);
    }
    mongoose.disconnect();
  });
