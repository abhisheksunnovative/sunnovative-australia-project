import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const EpcPartner = mongoose.model('EpcPartner', new mongoose.Schema({}, { strict: false }));
  const epc = await EpcPartner.findOne({ companyName: /ausgrid/i });

  if (epc) {
    console.log('\n--- AUSGRID SOLAR SOLUTIONS RECORD ---');
    console.log('ID:', epc._id);
    console.log('Company Name:', epc.companyName);
    console.log('Email:', epc.email);
    console.log('Mobile:', epc.mobile || epc.phone);
    console.log('Owner Name:', epc.ownerName);

    // Set known PIN '1234' for fast login
    const hashedPin = await bcrypt.hash('1234', 10);
    epc.loginPin = hashedPin;
    await epc.save();
    console.log('\nUpdated PIN to 1234 for Ausgrid Solar Solutions!');
  } else {
    console.log('Ausgrid Solar Solutions not found in EpcPartner collection.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
