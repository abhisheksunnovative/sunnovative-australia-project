import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'D:/sunnovative-australia-website/Website_Backend/.env' });

const schema = new mongoose.Schema({
  country: { type: String, required: true, lowercase: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  pincodes: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const District = mongoose.model('District', schema);

const seedData = [
  // INDIA - Gujarat
  { country: 'india', state: 'Gujarat', district: 'Ahmedabad', pincodes: ['380001', '380002'] },
  { country: 'india', state: 'Gujarat', district: 'Surat', pincodes: ['395001', '395002'] },
  { country: 'india', state: 'Gujarat', district: 'Vadodara', pincodes: ['390001', '390002'] },
  { country: 'india', state: 'Gujarat', district: 'Rajkot', pincodes: ['360001', '360002'] },
  { country: 'india', state: 'Gujarat', district: 'Bhavnagar', pincodes: ['364001', '364002'] },
  { country: 'india', state: 'Gujarat', district: 'Jamnagar', pincodes: ['361001', '361002'] },
  { country: 'india', state: 'Gujarat', district: 'Gandhinagar', pincodes: ['382010', '382011'] },
  { country: 'india', state: 'Gujarat', district: 'Junagadh', pincodes: ['362001', '362002'] },
  { country: 'india', state: 'Gujarat', district: 'Kutch', pincodes: ['370001', '370201'] },
  { country: 'india', state: 'Gujarat', district: 'Anand', pincodes: ['388001', '388120'] },
  { country: 'india', state: 'Gujarat', district: 'Navsari', pincodes: ['396445', '396450'] },
  { country: 'india', state: 'Gujarat', district: 'Amreli', pincodes: ['365601', '365602'] },
  { country: 'india', state: 'Gujarat', district: 'Patan', pincodes: ['384265', '384266'] },
  { country: 'india', state: 'Gujarat', district: 'Mehsana', pincodes: ['384001', '384002'] },

  // INDIA - Uttar Pradesh
  { country: 'india', state: 'Uttar Pradesh', district: 'Lucknow', pincodes: ['226001', '226002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Kanpur', pincodes: ['208001', '208002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Varanasi', pincodes: ['221001', '221002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Agra', pincodes: ['282001', '282002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Prayagraj', pincodes: ['211001', '211002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Meerut', pincodes: ['250001', '250002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Ghaziabad', pincodes: ['201001', '201002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Noida', pincodes: ['201301', '201302'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Aligarh', pincodes: ['202001', '202002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Bareilly', pincodes: ['243001', '243002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Moradabad', pincodes: ['244001', '244002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Gorakhpur', pincodes: ['273001', '273002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Jhansi', pincodes: ['284001', '284002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Mathura', pincodes: ['281001', '281002'] },
  { country: 'india', state: 'Uttar Pradesh', district: 'Ayodhya', pincodes: ['224123'] },

  // INDIA - Bihar
  { country: 'india', state: 'Bihar', district: 'Patna', pincodes: ['800001', '800002'] },
  { country: 'india', state: 'Bihar', district: 'Gaya', pincodes: ['823001', '823002'] },
  { country: 'india', state: 'Bihar', district: 'Bhagalpur', pincodes: ['812001', '812002'] },
  { country: 'india', state: 'Bihar', district: 'Muzaffarpur', pincodes: ['842001', '842002'] },
  { country: 'india', state: 'Bihar', district: 'Purnia', pincodes: ['854301', '854302'] },
  { country: 'india', state: 'Bihar', district: 'Darbhanga', pincodes: ['846001', '846004'] },
  { country: 'india', state: 'Bihar', district: 'Bihar Sharif', pincodes: ['803101'] },
  { country: 'india', state: 'Bihar', district: 'Arrah', pincodes: ['802301'] },
  { country: 'india', state: 'Bihar', district: 'Begusarai', pincodes: ['851101'] },
  { country: 'india', state: 'Bihar', district: 'Katihar', pincodes: ['854105'] },
  { country: 'india', state: 'Bihar', district: 'Munger', pincodes: ['811201'] },
  { country: 'india', state: 'Bihar', district: 'Chhapra', pincodes: ['841301'] },
  { country: 'india', state: 'Bihar', district: 'Sasaram', pincodes: ['821115'] },
  { country: 'india', state: 'Bihar', district: 'Hajipur', pincodes: ['844101'] },
  
  // INDIA - Other States
  { country: 'india', state: 'Maharashtra', district: 'Mumbai', pincodes: ['400001', '400002'] },
  { country: 'india', state: 'Maharashtra', district: 'Pune', pincodes: ['411001', '411002'] },
  { country: 'india', state: 'Delhi', district: 'New Delhi', pincodes: ['110001', '110002'] },
  { country: 'india', state: 'Karnataka', district: 'Bengaluru', pincodes: ['560001', '560002'] },
  { country: 'india', state: 'Telangana', district: 'Hyderabad', pincodes: ['500001', '500002'] },
  { country: 'india', state: 'Tamil Nadu', district: 'Chennai', pincodes: ['600001', '600002'] },

  // AUSTRALIA
  { country: 'australia', state: 'New South Wales', district: 'Sydney', pincodes: ['2000', '2001'] },
  { country: 'australia', state: 'New South Wales', district: 'Newcastle', pincodes: ['2300', '2302'] },
  { country: 'australia', state: 'New South Wales', district: 'Wollongong', pincodes: ['2500', '2502'] },
  { country: 'australia', state: 'Victoria', district: 'Melbourne', pincodes: ['3000', '3001'] },
  { country: 'australia', state: 'Victoria', district: 'Geelong', pincodes: ['3220', '3221'] },
  { country: 'australia', state: 'Victoria', district: 'Ballarat', pincodes: ['3350', '3353'] },
  { country: 'australia', state: 'Queensland', district: 'Brisbane', pincodes: ['4000', '4001'] },
  { country: 'australia', state: 'Queensland', district: 'Gold Coast', pincodes: ['4217', '4218'] },
  { country: 'australia', state: 'Queensland', district: 'Sunshine Coast', pincodes: ['4551', '4558'] },
  { country: 'australia', state: 'Western Australia', district: 'Perth', pincodes: ['6000', '6001'] },
  { country: 'australia', state: 'South Australia', district: 'Adelaide', pincodes: ['5000', '5001'] },
  { country: 'australia', state: 'Tasmania', district: 'Hobart', pincodes: ['7000', '7001'] },
  { country: 'australia', state: 'Australian Capital Territory', district: 'Canberra', pincodes: ['2600', '2601'] },
  { country: 'australia', state: 'Northern Territory', district: 'Darwin', pincodes: ['0800', '0801'] }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB');

    await District.deleteMany({});
    console.log('Cleared existing districts (without state fields)');

    await District.insertMany(seedData);
    console.log(`Successfully seeded ${seedData.length} districts and pincodes with STATES!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
