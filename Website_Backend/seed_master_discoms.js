import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { BillTemplate } from './src/models/BillTemplate.js';
import { Discom } from './src/models/DiscomModel.js';

dotenv.config();

const seedMaster = async () => {
  await connectDB();
  console.log('Seeding Master DISCOMs and Templates...');

  const discomsList = [
    { name: 'Maharashtra State Electricity Distribution Co.', short_code: 'MSEDCL', state: 'Maharashtra', country: 'India' },
    { name: 'Uttar Pradesh Power Corporation Limited', short_code: 'UPPCL', state: 'Uttar Pradesh', country: 'India' },
    { name: 'Bangalore Electricity Supply Company', short_code: 'BESCOM', state: 'Karnataka', country: 'India' },
    { name: 'Tamil Nadu Generation and Distribution Corp', short_code: 'TANGEDCO', state: 'Tamil Nadu', country: 'India' },
    { name: 'Paschim Gujarat Vij Company Ltd', short_code: 'PGVCL', state: 'Gujarat', country: 'India' },
    { name: 'Origin Energy', short_code: 'ORIGIN', state: 'NSW', country: 'Australia' },
    { name: 'AGL Energy', short_code: 'AGL', state: 'VIC', country: 'Australia' }
  ];

  const templateRules = {
    MSEDCL: { consumer_number: ['Consumer No', 'Account No'], units_consumed: ['Billed Units'], total_bill: ['Net Payable'] },
    UPPCL: { consumer_number: ['Account No', 'K No', 'Connection No'], units_consumed: ['Total Units', 'KWH'], total_bill: ['Payable Amount', 'Amount'] },
    BESCOM: { consumer_number: ['Account ID', 'Consumer No'], units_consumed: ['Units Consumed', 'KWH'], total_bill: ['Net Amount Due'] },
    TANGEDCO: { consumer_number: ['Service No', 'Consumer No'], units_consumed: ['Units Billed'], total_bill: ['Amount Payable'] },
    PGVCL: { consumer_number: ['Consumer No', 'Account'], units_consumed: ['Consumption', 'Units'], total_bill: ['Bill Amount'] },
    ORIGIN: { consumer_number: ['Customer Number', 'Account No'], units_consumed: ['Usage', 'kWh'], total_bill: ['Total Amount Due'] },
    AGL: { consumer_number: ['Account Number'], units_consumed: ['Electricity Usage'], total_bill: ['Please Pay'] }
  };

  for (const d of discomsList) {
    let discom = await Discom.findOne({ short_code: d.short_code });
    if (!discom) {
      discom = await Discom.create(d);
    }
    
    const existingTemplate = await BillTemplate.findOne({ discom_id: discom._id });
    if (!existingTemplate) {
      await BillTemplate.create({
        discom_id: discom._id,
        consumer_type: 'Residential',
        version: 'Master_v1',
        effective_from: new Date(),
        OCR_aliases_json: templateRules[d.short_code],
        active: true
      });
    }
  }

  console.log('✅ Master DISCOMs and Templates seeded successfully!');
  process.exit();
};

seedMaster();
