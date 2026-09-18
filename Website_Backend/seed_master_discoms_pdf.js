import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Discom } from './src/models/DiscomModel.js';

const discomsList = [
  { state: 'Andhra Pradesh', name: 'Andhra Pradesh Eastern Power Distribution Company Ltd', short_code: 'APEPDCL' },
  { state: 'Andhra Pradesh', name: 'Andhra Pradesh Central Power Distribution Corporation Ltd', short_code: 'APCPDCL' },
  { state: 'Andhra Pradesh', name: 'Andhra Pradesh Southern Power Distribution Company Ltd', short_code: 'APSPDCL' },
  { state: 'Arunachal Pradesh', name: 'Department of Power, Government of Arunachal Pradesh', short_code: 'DoP Arunachal' },
  { state: 'Assam', name: 'Assam Power Distribution Company Ltd', short_code: 'APDCL' },
  { state: 'Bihar', name: 'North Bihar Power Distribution Company Ltd', short_code: 'NBPDCL' },
  { state: 'Bihar', name: 'South Bihar Power Distribution Company Ltd', short_code: 'SBPDCL' },
  { state: 'Chhattisgarh', name: 'Chhattisgarh State Power Distribution Company Ltd', short_code: 'CSPDCL' },
  { state: 'Goa', name: 'Electricity Department, Government of Goa', short_code: 'Goa ED' },
  { state: 'Gujarat', name: 'Dakshin Gujarat Vij Company Ltd', short_code: 'DGVCL' },
  { state: 'Gujarat', name: 'Madhya Gujarat Vij Company Ltd', short_code: 'MGVCL' },
  { state: 'Gujarat', name: 'Paschim Gujarat Vij Company Ltd', short_code: 'PGVCL' },
  { state: 'Gujarat', name: 'Uttar Gujarat Vij Company Ltd', short_code: 'UGVCL' },
  { state: 'Gujarat', name: 'Torrent Power Ltd - Ahmedabad, Gandhinagar and Surat areas', short_code: 'TPL' },
  { state: 'Haryana', name: 'Dakshin Haryana Bijli Vitran Nigam Ltd', short_code: 'DHBVN' },
  { state: 'Haryana', name: 'Uttar Haryana Bijli Vitran Nigam Ltd', short_code: 'UHBVN' },
  { state: 'Himachal Pradesh', name: 'Himachal Pradesh State Electricity Board Ltd', short_code: 'HPSEBL' },
  { state: 'Jharkhand', name: 'Jharkhand Bijli Vitran Nigam Ltd', short_code: 'JBVNL' },
  { state: 'Jharkhand', name: 'Tata Steel Utilities and Infrastructure Services Ltd - Jamshedpur', short_code: 'TSUISL' },
  { state: 'Jharkhand', name: 'Damodar Valley Corporation - notified command areas', short_code: 'DVC' },
  { state: 'Karnataka', name: 'Bangalore Electricity Supply Company Ltd', short_code: 'BESCOM' },
  { state: 'Karnataka', name: 'Chamundeshwari Electricity Supply Corporation Ltd', short_code: 'CESC Mysuru' },
  { state: 'Karnataka', name: 'Gulbarga Electricity Supply Company Ltd', short_code: 'GESCOM' },
  { state: 'Karnataka', name: 'Hubli Electricity Supply Company Ltd', short_code: 'HESCOM' },
  { state: 'Karnataka', name: 'Mangalore Electricity Supply Company Ltd', short_code: 'MESCOM' },
  { state: 'Karnataka', name: 'Hukkeri Rural Electric Co-operative Society Ltd', short_code: 'HRECS' },
  { state: 'Kerala', name: 'Kerala State Electricity Board Ltd', short_code: 'KSEBL' },
  { state: 'Kerala', name: 'Thrissur Corporation Electricity Department', short_code: 'TCED' },
  { state: 'Madhya Pradesh', name: 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd', short_code: 'MPMKVVCL' },
  { state: 'Madhya Pradesh', name: 'Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd', short_code: 'MPPKVVCL' },
  { state: 'Madhya Pradesh', name: 'Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Ltd', short_code: 'MPPoKVVCL' },
  { state: 'Maharashtra', name: 'Maharashtra State Electricity Distribution Company Ltd', short_code: 'MSEDCL' },
  { state: 'Maharashtra', name: 'Brihanmumbai Electric Supply and Transport Undertaking', short_code: 'BEST' },
  { state: 'Maharashtra', name: 'Adani Electricity Mumbai Ltd', short_code: 'AEML' },
  { state: 'Maharashtra', name: 'Tata Power Company Ltd - Mumbai Distribution', short_code: 'TPC-D' },
  { state: 'Manipur', name: 'Manipur State Power Distribution Company Ltd', short_code: 'MSPDCL' },
  { state: 'Meghalaya', name: 'Meghalaya Power Distribution Corporation Ltd', short_code: 'MePDCL' },
  { state: 'Mizoram', name: 'Power and Electricity Department, Government of Mizoram', short_code: 'P&E Mizoram' },
  { state: 'Nagaland', name: 'Department of Power, Government of Nagaland', short_code: 'DoP Nagaland' },
  { state: 'Odisha', name: 'TP Central Odisha Distribution Ltd', short_code: 'TPCODL' },
  { state: 'Odisha', name: 'TP Northern Odisha Distribution Ltd', short_code: 'TPNODL' },
  { state: 'Odisha', name: 'TP Southern Odisha Distribution Ltd', short_code: 'TPSODL' },
  { state: 'Odisha', name: 'TP Western Odisha Distribution Ltd', short_code: 'TPWODL' },
  { state: 'Punjab', name: 'Punjab State Power Corporation Ltd', short_code: 'PSPCL' },
  { state: 'Rajasthan', name: 'Jaipur Vidyut Vitran Nigam Ltd', short_code: 'JVVNL' },
  { state: 'Rajasthan', name: 'Ajmer Vidyut Vitran Nigam Ltd', short_code: 'AVVNL' },
  { state: 'Rajasthan', name: 'Jodhpur Vidyut Vitran Nigam Ltd', short_code: 'JDVVNL' },
  { state: 'Sikkim', name: 'Energy and Power Department, Government of Sikkim', short_code: 'E&P Sikkim' },
  { state: 'Tamil Nadu', name: 'Tamil Nadu Power Distribution Corporation Ltd', short_code: 'TNPDCL' },
  { state: 'Telangana', name: 'Telangana Southern Power Distribution Company Ltd', short_code: 'TGSPDCL' },
  { state: 'Telangana', name: 'Telangana Northern Power Distribution Company Ltd', short_code: 'TGNPDCL' },
  { state: 'Tripura', name: 'Tripura State Electricity Corporation Ltd', short_code: 'TSECL' },
  { state: 'Uttar Pradesh', name: 'Dakshinanchal Vidyut Vitran Nigam Ltd', short_code: 'DVVNL' },
  { state: 'Uttar Pradesh', name: 'Madhyanchal Vidyut Vitran Nigam Ltd', short_code: 'MVVNL' },
  { state: 'Uttar Pradesh', name: 'Paschimanchal Vidyut Vitran Nigam Ltd', short_code: 'PVVNL' },
  { state: 'Uttar Pradesh', name: 'Purvanchal Vidyut Vitran Nigam Ltd', short_code: 'PuVVNL' },
  { state: 'Uttar Pradesh', name: 'Kanpur Electricity Supply Company Ltd', short_code: 'KESCO' },
  { state: 'Uttar Pradesh', name: 'Noida Power Company Ltd - Greater Noida', short_code: 'NPCL' },
  { state: 'Uttarakhand', name: 'Uttarakhand Power Corporation Ltd', short_code: 'UPCL' },
  { state: 'West Bengal', name: 'West Bengal State Electricity Distribution Company Ltd', short_code: 'WBSEDCL' },
  { state: 'West Bengal', name: 'CESC Ltd - Kolkata and adjoining areas', short_code: 'CESC' },
  { state: 'West Bengal', name: 'India Power Corporation Ltd - Asansol distribution area', short_code: 'IPCL' },
  { state: 'West Bengal', name: 'Damodar Valley Corporation - applicable industrial command areas', short_code: 'DVC' },
  { state: 'Andaman and Nicobar Islands', name: 'Electricity Department, Andaman and Nicobar Administration', short_code: 'A&N ED' },
  { state: 'Chandigarh', name: 'Chandigarh Power Distribution Ltd', short_code: 'CPDL' },
  { state: 'Dadra and Nagar Haveli and Daman and Diu', name: 'DNH and DD Power Distribution Corporation Ltd', short_code: 'DNHDDPDCL' },
  { state: 'Delhi', name: 'BSES Rajdhani Power Ltd', short_code: 'BRPL' },
  { state: 'Delhi', name: 'BSES Yamuna Power Ltd', short_code: 'BYPL' },
  { state: 'Delhi', name: 'Tata Power Delhi Distribution Ltd', short_code: 'TPDDL' },
  { state: 'Delhi', name: 'New Delhi Municipal Council - Electricity Department', short_code: 'NDMC' },
  { state: 'Jammu and Kashmir', name: 'Jammu Power Distribution Corporation Ltd', short_code: 'JPDCL' },
  { state: 'Jammu and Kashmir', name: 'Kashmir Power Distribution Corporation Ltd', short_code: 'KPDCL' },
  { state: 'Ladakh', name: 'Power Development Department, Administration of Ladakh', short_code: 'PDD Ladakh' },
  { state: 'Lakshadweep', name: 'Electricity Department, Lakshadweep Administration', short_code: 'Lakshadweep ED' },
  { state: 'Puducherry', name: 'Electricity Department, Government of Puducherry', short_code: 'PED' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to DB');

    await Discom.deleteMany({ country: 'India' });
    console.log('Cleared existing Indian Discoms from the DB');

    const toInsert = discomsList.map(d => ({
      name: d.name,
      short_code: d.short_code,
      state: d.state,
      country: 'India',
      isActive: true,
      licensee_type: d.name.includes('Pvt') || d.name.includes('Torrent') || d.name.includes('Tata') || d.name.includes('Adani') ? 'private' : 'public'
    }));

    await Discom.insertMany(toInsert);
    console.log("Successfully inserted " + toInsert.length + " valid Discoms from the PDF.");
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

