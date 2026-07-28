const mongoose = require('mongoose');
const uri = 'mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP';

mongoose.connect(uri).then(async () => {
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  
  const projects = await ProjectOrder.find();
  for (const p of projects) {
    if (p.steps && p.steps.length > 0) {
      p.steps = p.steps.map(s => {
        if (s.stepId === 'survey') { s.requiresDoc = true; s.description = 'Technical site survey by EPC partner'; }
        else if (s.stepId === 'design') { s.requiresDoc = false; s.description = 'System design and net-metering approvals'; }
        else if (s.stepId === 'installation') { s.requiresDoc = true; s.description = 'Solar panel installation and wiring'; }
        else if (s.stepId === 'commissioning') { s.requiresDoc = true; s.description = 'System activation and final testing'; }
        return s;
      });
      await ProjectOrder.updateOne({ _id: p._id }, { $set: { steps: p.steps } });
      console.log('Fixed steps for', p.customerName);
    }
  }
  process.exit(0);
});
