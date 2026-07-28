const mongoose = require('mongoose');
const uri = 'mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP';

mongoose.connect(uri).then(async () => {
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));
  
  const leadsWithBde = await Lead.find({ assignedBde: { $ne: null }, status: 'Converted' });
  let fixedCount = 0;
  
  for (let lead of leadsWithBde) {
    const project = await ProjectOrder.findOne({ customerMobile: lead.mobile });
    if (project && !project.assignedBde) {
      await ProjectOrder.updateOne({ _id: project._id }, { $set: { assignedBde: lead.assignedBde } });
      fixedCount++;
      console.log('Fixed project for', lead.name);
    }
  }
  
  console.log('Total fixed:', fixedCount);
  process.exit(0);
});
