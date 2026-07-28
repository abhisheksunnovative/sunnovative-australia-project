import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log('Connected to DB');

  const { ProjectOrder } = await import('./src/models/ProjectModel.js');
  const EpcPartner = (await import('./src/models/EpcPartner.js')).default;
  const EpcWallet = (await import('./src/models/EpcWallet.js')).default;

  // Find an EPC
  const epc = await EpcPartner.findOne({});
  if (!epc) { console.log('No EPC found'); process.exit(); }
  console.log('Seeding data for EPC:', epc.companyName, epc._id);

  // Upgrade their plan to Enterprise to allow cross-district
  epc.plan = 'Enterprise';
  epc.activeDistricts = ['Surat', 'Ahmedabad', 'Vadodara'];
  await epc.save();
  console.log('Set EPC plan to Enterprise and active districts to Surat, Ahmedabad, Vadodara');

  // Find or create wallet
  let wallet = await EpcWallet.findOne({ epcPartner: epc._id });
  if (!wallet) {
    wallet = new EpcWallet({ epcPartner: epc._id, credits: [], transactions: [] });
  }

  // Set wallet credits to have excess supply in Ahmedabad, and some in Vadodara
  wallet.credits = [
    { district: 'Ahmedabad', projectType: 'Surya Ghar Yojana', credits: 100 }, // Lot of supply
    { district: 'Vadodara', projectType: 'Surya Ghar Yojana', credits: 50 },
    { district: 'Surat', projectType: 'Surya Ghar Yojana', credits: 10 }
  ];
  await wallet.save();
  console.log('Added credits to wallet.');

  // Create High Demand in Surat (No supply, lots of leads)
  // Create Low Demand in Ahmedabad (Lots of supply, no leads)
  
  // Clear recent dummy leads to avoid conflicts
  await ProjectOrder.deleteMany({ 'location.district': { $in: ['Surat', 'Ahmedabad', 'Vadodara'] }, customerName: 'Dummy Tester' });

  for (let i = 0; i < 20; i++) {
    // 20 leads of 5 KW in Surat = 100 KW demand
    await ProjectOrder.create({
      customerName: 'Dummy Tester',
      customerMobile: '9999999999',
      projectType: 'residential',
      systemSizeKW: 5,
      location: { district: 'Surat', state: 'Gujarat' },
      status: 'lead'
    });
  }

  for (let i = 0; i < 2; i++) {
    // 2 leads of 5 KW in Vadodara = 10 KW demand
    await ProjectOrder.create({
      customerName: 'Dummy Tester',
      customerMobile: '9999999999',
      projectType: 'residential',
      systemSizeKW: 5,
      location: { district: 'Vadodara', state: 'Gujarat' },
      status: 'lead'
    });
  }
  // Ahmedabad gets 0 leads (0 Demand).

  console.log('Inserted Dummy Leads for Demand.');
  console.log('DONE!');
  process.exit();
};

run();
