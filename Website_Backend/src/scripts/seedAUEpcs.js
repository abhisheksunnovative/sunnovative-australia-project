import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const EpcPartner = (await import('../models/EpcPartner.js')).default;
const EpcWallet = (await import('../models/EpcWallet.js')).default;
const Brand = (await import('../models/Brand.js')).default;

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/emerge_sun');
  console.log('Connected to DB');

  const auBrands = await Brand.find({ country: 'australia' }).limit(4);
  const solarBrandIds = auBrands.filter(b => b.type === 'Solar').map(b => b._id);
  const inverterBrandIds = auBrands.filter(b => b.type === 'Inverter').map(b => b._id);

  const epcNames = ['AU Solar Masters', 'Sydney Bright Energy', 'Aussie Power Grid', 'Melbourne Sun Catchers'];
  const baseEmail = 'auepc';

  for (let i = 0; i < 4; i++) {
    const email = baseEmail + (i+1) + '@test.com';
    
    let epc = await EpcPartner.findOne({ email });
    if (!epc) {
      epc = new EpcPartner({ email });
    }
    
    epc.companyName = epcNames[i];
    epc.ownerName = 'Owner ' + (i+1);
    epc.mobile = '041234567' + i;
    epc.password = '$2a$10$xyz123';
    epc.country = 'australia';
    epc.state = 'all';
    epc.district = 'all';
    epc.city = 'Sydney';
    epc.pincode = '2000';
    epc.address = '123 George St';
    epc.rating = 4.9;
    epc.totalRatings = 120;
    epc.totalInstallations = 50;
    epc.onboardingStatus = 'Active';
    epc.isVerified = true;
    epc.hasTrustedBadge = true;
    epc.trustBadge = { isVerified: true, issuedAt: new Date(), validUntil: new Date(Date.now() + 31536000000) };
    
    epc.activeDistricts = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'all'];
    epc.serviceAreas = [{ state: 'all', district: 'all' }];
    
    epc.brandOfferings = [{
      district: 'all',
      solarBrands: solarBrandIds,
      inverterBrands: inverterBrandIds
    }];
    
    epc.pricing = {
      baseRatePerKw: 1000 - (i * 50),
      discount: 5,
    };
    
    await epc.save();
    
    let wallet = await EpcWallet.findOne({ epcPartner: epc._id });
    if (!wallet) {
      wallet = new EpcWallet({ epcPartner: epc._id, district: 'all', state: 'all', country: 'australia' });
    }
    wallet.credits = [{ kw: 5000, purchasedAt: new Date(), expiresAt: new Date(Date.now() + 31536000000), projectType: 'residential' }];
    wallet.totalCredits = 5000;
    wallet.availableCredits = 5000;
    wallet.totalUsed = 0;
    await wallet.save();
    
    console.log('Created AU EPC: ' + epc.companyName + ' (' + email + ')');
  }
  
  mongoose.disconnect();
  console.log('Seeding Complete');
}

seed().catch(console.error);
