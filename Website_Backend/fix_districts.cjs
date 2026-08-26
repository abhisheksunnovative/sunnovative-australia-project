const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sunnovative:Vidyut123@ac-yca0bk9.ui24irh.mongodb.net/sunnovative?retryWrites=true&w=majority').then(async () => {
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
  
  const docs = await ProjectOrder.find();
  let c = 0;
  for (const d of docs) {
    if (!d.get('location.district')) {
      const l = await Lead.findOne({ convertedProjectId: d._id });
      if (l) {
        await ProjectOrder.updateOne({ _id: d._id }, { $set: { 'location.district': l.get('district') || l.get('city') || 'Unknown' } });
        c++;
      } else {
        await ProjectOrder.updateOne({ _id: d._id }, { $set: { 'location.district': 'Unknown' } });
        c++;
      }
    }
  }
  console.log('Updated', c);
  process.exit(0);
}).catch(console.error);
