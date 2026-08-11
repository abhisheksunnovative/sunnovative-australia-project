import mongoose from 'mongoose';

async function run() {
  try {
    await mongoose.connect('mongodb+srv://user:user@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net/test');
    const bdeSchema = new mongoose.Schema({}, { strict: false });
    const BDE = mongoose.model('BDE', bdeSchema, 'bdes');
    
    const bdes = await BDE.find({});
    for (let bde of bdes) {
      if (bde.assignedDistricts && bde.assignedDistricts.length > 0) {
         let stateToSet = null;
         const dstr = bde.assignedDistricts.join(' ').toLowerCase();
         
         if (dstr.includes('sydney')) {
           stateToSet = 'New South Wales';
         } else if (dstr.includes('ahmedabad') || dstr.includes('surat') || dstr.includes('rajkot')) {
           stateToSet = 'Gujarat';
         } else if (dstr.includes('lucknow') || dstr.includes('noida') || dstr.includes('kanpur') || dstr.includes('varanasi')) {
           stateToSet = 'Uttar Pradesh';
         } else if (dstr.includes('patna') || dstr.includes('gaya')) {
           stateToSet = 'Bihar';
         } else if (dstr.includes('melbourne')) {
           stateToSet = 'Victoria';
         } else if (dstr.includes('brisbane')) {
           stateToSet = 'Queensland';
         }

         if (stateToSet && (!bde.assignedStates || bde.assignedStates.length === 0)) {
           console.log(`Setting state ${stateToSet} for ${bde.name}`);
           await BDE.updateOne({_id: bde._id}, {$set: {assignedStates: [stateToSet]}});
         }
      }
    }
    console.log('Done fixing BDEs');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();