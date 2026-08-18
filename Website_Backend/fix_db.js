import('mongoose').then(async (m) => {
  await m.connect('mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP');
  const ProjectOrder = m.model('ProjectOrder', new m.Schema({}, { strict: false }));
  
  await ProjectOrder.updateOne(
    { orderNumber: 'SUN-2026-3672', 'stagePayments.stageKey': 'stage1' },
    { $set: { 
        paymentBlockActive: true, 
        activePaymentStage: 'stage1',
        'stagePayments.$.status': 'pending'
      } 
    }
  );
  
  console.log('Fixed DB state for SUN-2026-3672');
  process.exit();
});
