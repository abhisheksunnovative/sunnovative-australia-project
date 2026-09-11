import('mongoose').then(async (m) => {
  await m.connect('mongodb://structasoftadmin_db_user:w6EuikcNSYs20hlY@ac-yca0bk9-shard-00-00.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-01.ui24irh.mongodb.net:27017,ac-yca0bk9-shard-00-02.ui24irh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ah9712-shard-0&authSource=admin&retryWrites=true&w=majority&appName=SUNNOVATIVE-ERP');
  const ProjectOrder = m.model('ProjectOrder', new m.Schema({}, { strict: false }));
  
  await ProjectOrder.updateOne(
    { orderNumber: 'SUN-2026-3672' },
    { 
      $set: { 
        stagePayments: [{
            stageKey: 'stage1',
            label: 'Stage 1: Deposit / Booking',
            valueType: 'percentage',
            value: 10,
            amount: 15000,
            status: 'pending',
            isMandatory: true,
            recipientType: 'epc',
            gatewayRequired: true
        }],
        paymentBlockActive: true, 
        activePaymentStage: 'stage1'
      } 
    }
  );
  
  console.log('Successfully injected stagePayments and activated block for SUN-2026-3672');
  process.exit();
});
