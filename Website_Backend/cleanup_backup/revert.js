import('mongoose').then(async (m) => {
  await m.connect('mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP');
  const ProjectOrder = m.model('ProjectOrder', new m.Schema({}, { strict: false }));
  
  await ProjectOrder.updateOne(
    { orderNumber: 'SUN-2026-3672', 'journeySteps.stepId': 'au_res_1' },
    { $set: { 'journeySteps.$.status': 'in-progress', 'journeySteps.$.completedAt': null, 'journeySteps.$.completedBy': '' } }
  );
  await ProjectOrder.updateOne(
    { orderNumber: 'SUN-2026-3672', 'journeySteps.stepId': 'au_res_2' },
    { $set: { 'journeySteps.$.status': 'pending', 'journeySteps.$.startedAt': null } }
  );
  
  // also set currentStep
  await ProjectOrder.updateOne(
    { orderNumber: 'SUN-2026-3672' },
    { $set: { pendingActionFor: 'customer' } }
  );
  
  console.log('Reverted step 1 and 2.');
  process.exit();
});
