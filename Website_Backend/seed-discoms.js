import mongoose from 'mongoose';
import { Discom } from './src/models/DiscomModel.js'; 

const data = [
  { state: 'Andhra Pradesh', discoms: [
    ['Andhra Pradesh Eastern Power Distribution Company Ltd', 'APEPDCL'],
    ['Andhra Pradesh Central Power Distribution Corporation Ltd', 'APCPDCL'],
    ['Andhra Pradesh Southern Power Distribution Company Ltd', 'APSPDCL']
  ]},
  { state: 'Arunachal Pradesh', discoms: [['Department of Power, Government of Arunachal Pradesh', 'DoP Arunachal']]},
  { state: 'Assam', discoms: [['Assam Power Distribution Company Ltd', 'APDCL']]},
  { state: 'Bihar', discoms: [
    ['North Bihar Power Distribution Company Ltd', 'NBPDCL'],
    ['South Bihar Power Distribution Company Ltd', 'SBPDCL']
  ]},
  { state: 'Chhattisgarh', discoms: [['Chhattisgarh State Power Distribution Company Ltd', 'CSPDCL']]},
  { state: 'Goa', discoms: [['Electricity Department, Government of Goa', 'Goa ED']]},
  { state: 'Gujarat', discoms: [
    ['Dakshin Gujarat Vij Company Ltd', 'DGVCL'],
    ['Madhya Gujarat Vij Company Ltd', 'MGVCL'],
    ['Paschim Gujarat Vij Company Ltd', 'PGVCL'],
    ['Uttar Gujarat Vij Company Ltd', 'UGVCL'],
    ['Torrent Power Ltd - Ahmedabad, Gandhinagar and Surat areas', 'TPL']
  ]},
  { state: 'Haryana', discoms: [
    ['Dakshin Haryana Bijli Vitran Nigam Ltd', 'DHBVN'],
    ['Uttar Haryana Bijli Vitran Nigam Ltd', 'UHBVN']
  ]},
  { state: 'Himachal Pradesh', discoms: [['Himachal Pradesh State Electricity Board Ltd', 'HPSEBL']]},
  { state: 'Jharkhand', discoms: [
    ['Jharkhand Bijli Vitran Nigam Ltd', 'JBVNL'],
    ['Tata Steel Utilities and Infrastructure Services Ltd - Jamshedpur', 'TSUISL'],
    ['Damodar Valley Corporation - notified command areas', 'DVC']
  ]},
  { state: 'Karnataka', discoms: [
    ['Bangalore Electricity Supply Company Ltd', 'BESCOM'],
    ['Chamundeshwari Electricity Supply Corporation Ltd', 'CESC Mysuru'],
    ['Gulbarga Electricity Supply Company Ltd', 'GESCOM'],
    ['Hubli Electricity Supply Company Ltd', 'HESCOM'],
    ['Mangalore Electricity Supply Company Ltd', 'MESCOM'],
    ['Hukkeri Rural Electric Co-operative Society Ltd', 'HRECS']
  ]},
  { state: 'Kerala', discoms: [
    ['Kerala State Electricity Board Ltd', 'KSEBL'],
    ['Thrissur Corporation Electricity Department', 'TCED']
  ]},
  { state: 'Madhya Pradesh', discoms: [
    ['Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd', 'MPMKVVCL'],
    ['Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd', 'MPPKVVCL'],
    ['Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Ltd', 'MPPoKVVCL']
  ]},
  { state: 'Maharashtra', discoms: [
    ['Maharashtra State Electricity Distribution Company Ltd', 'MSEDCL'],
    ['Brihanmumbai Electric Supply and Transport Undertaking', 'BEST'],
    ['Adani Electricity Mumbai Ltd', 'AEML'],
    ['Tata Power Company Ltd - Mumbai Distribution', 'TPC-D']
  ]},
  { state: 'Manipur', discoms: [['Manipur State Power Distribution Company Ltd', 'MSPDCL']]},
  { state: 'Meghalaya', discoms: [['Meghalaya Power Distribution Corporation Ltd', 'MePDCL']]},
  { state: 'Mizoram', discoms: [['Power and Electricity Department, Government of Mizoram', 'P&E Mizoram']]},
  { state: 'Nagaland', discoms: [['Department of Power, Government of Nagaland', 'DoP Nagaland']]},
  { state: 'Odisha', discoms: [
    ['TP Central Odisha Distribution Ltd', 'TPCODL'],
    ['TP Northern Odisha Distribution Ltd', 'TPNODL'],
    ['TP Southern Odisha Distribution Ltd', 'TPSODL'],
    ['TP Western Odisha Distribution Ltd', 'TPWODL']
  ]},
  { state: 'Punjab', discoms: [['Punjab State Power Corporation Ltd', 'PSPCL']]},
  { state: 'Rajasthan', discoms: [
    ['Jaipur Vidyut Vitran Nigam Ltd', 'JVVNL'],
    ['Ajmer Vidyut Vitran Nigam Ltd', 'AVVNL'],
    ['Jodhpur Vidyut Vitran Nigam Ltd', 'JDVVNL']
  ]},
  { state: 'Sikkim', discoms: [['Energy and Power Department, Government of Sikkim', 'E&P Sikkim']]},
  { state: 'Tamil Nadu', discoms: [['Tamil Nadu Power Distribution Corporation Ltd', 'TNPDCL']]},
  { state: 'Telangana', discoms: [
    ['Telangana Southern Power Distribution Company Ltd', 'TGSPDCL'],
    ['Telangana Northern Power Distribution Company Ltd', 'TGNPDCL']
  ]},
  { state: 'Tripura', discoms: [['Tripura State Electricity Corporation Ltd', 'TSECL']]},
  { state: 'Uttar Pradesh', discoms: [
    ['Dakshinanchal Vidyut Vitran Nigam Ltd', 'DVVNL'],
    ['Madhyanchal Vidyut Vitran Nigam Ltd', 'MVVNL'],
    ['Paschimanchal Vidyut Vitran Nigam Ltd', 'PVVNL'],
    ['Purvanchal Vidyut Vitran Nigam Ltd', 'PuVVNL'],
    ['Kanpur Electricity Supply Company Ltd', 'KESCO'],
    ['Noida Power Company Ltd - Greater Noida', 'NPCL']
  ]},
  { state: 'Uttarakhand', discoms: [['Uttarakhand Power Corporation Ltd', 'UPCL']]},
  { state: 'West Bengal', discoms: [
    ['West Bengal State Electricity Distribution Company Ltd', 'WBSEDCL'],
    ['CESC Ltd - Kolkata and adjoining areas', 'CESC'],
    ['India Power Corporation Ltd - Asansol distribution area', 'IPCL'],
    ['Damodar Valley Corporation - applicable industrial command areas', 'DVC']
  ]},
  { state: 'Andaman and Nicobar Islands', discoms: [['Electricity Department, Andaman and Nicobar Administration', 'A&N ED']]},
  { state: 'Chandigarh', discoms: [['Chandigarh Power Distribution Ltd', 'CPDL']]},
  { state: 'Dadra and Nagar Haveli and Daman and Diu', discoms: [['DNH and DD Power Distribution Corporation Ltd', 'DNHDDPDCL']]},
  { state: 'Delhi', discoms: [
    ['BSES Rajdhani Power Ltd', 'BRPL'],
    ['BSES Yamuna Power Ltd', 'BYPL'],
    ['Tata Power Delhi Distribution Ltd', 'TPDDL'],
    ['New Delhi Municipal Council - Electricity Department', 'NDMC']
  ]},
  { state: 'Jammu and Kashmir', discoms: [
    ['Jammu Power Distribution Corporation Ltd', 'JPDCL'],
    ['Kashmir Power Distribution Corporation Ltd', 'KPDCL']
  ]},
  { state: 'Ladakh', discoms: [['Power Development Department, Administration of Ladakh', 'PDD Ladakh']]},
  { state: 'Lakshadweep', discoms: [['Electricity Department, Lakshadweep Administration', 'Lakshadweep ED']]},
  { state: 'Puducherry', discoms: [['Electricity Department, Government of Puducherry', 'PED']]},
];

async function seed() {
  await mongoose.connect('mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP');
  console.log('Connected');
  
  for (const group of data) {
    for (const d of group.discoms) {
      await Discom.updateOne(
        { short_code: d[1] },
        { 
          $set: { 
            name: d[0],
            short_code: d[1],
            state: group.state,
            country: 'India',
            isActive: true
          }
        },
        { upsert: true }
      );
    }
  }
  console.log('Seeded successfully!');
  process.exit(0);
}
seed().catch(console.error);
