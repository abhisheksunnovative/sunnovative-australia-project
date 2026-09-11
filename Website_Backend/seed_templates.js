import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { BillTemplate } from './src/models/BillTemplate.js';
import { Discom } from './src/models/DiscomModel.js';

dotenv.config();

const seedTemplates = async () => {
  await connectDB();
  console.log('Seeding initial Bill Templates...');

  // 1. Ensure at least one DISCOM exists (e.g. MSEDCL)
  let msedcl = await Discom.findOne({ short_code: 'MSEDCL' });
  if (!msedcl) {
    msedcl = await Discom.create({ name: 'Maharashtra State Electricity Distribution Co.', short_code: 'MSEDCL', state: 'Maharashtra', country: 'India' });
  }

  // 2. Create Template for MSEDCL
  const templateData = {
    discom_id: msedcl._id,
    consumer_type: 'Residential',
    version: '2026_v1',
    effective_from: new Date(),
    OCR_aliases_json: {
      consumer_number: ['Consumer No', 'Account No'],
      units_consumed: ['Billed Units', 'Units'],
      total_bill: ['Net Payable', 'Amount Payable', 'Payable Amount'],
      tariff_category: ['Tariff', 'Category']
    },
    active: true
  };

  await BillTemplate.deleteMany({ version: '2026_v1' });
  await BillTemplate.create(templateData);

  console.log('✅ Seeded MSEDCL Template successfully!');
  process.exit();
};

seedTemplates();
