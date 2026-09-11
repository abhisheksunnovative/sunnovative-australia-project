import('./src/config/db.js').then(async (m) => {
    await m.connectDB();
    const mongoose = (await import('mongoose')).default;
    const EpcPartner = (await import('./src/models/EpcPartner.js')).default;
    const epc = await EpcPartner.findOne({ _id: new mongoose.Types.ObjectId('6a4735a23d0799d446107f94') });
    
    let filter = {};
    let nullEpcCondition = {
      epcPartner: null,
      status: { $in: ['Open For EPC', 'Bid Running', 'Lead', 'Token Paid', 'Order Generated'] }
    };
    nullEpcCondition.state = epc.state;

    filter.$or = [
      { epcPartner: epc._id },
      nullEpcCondition
    ];
    filter.enquiryType = 'ECommerce';

    const EpcEnquiry = mongoose.model('EpcEnquiry', new mongoose.Schema({}, { strict: false }));
    const enqs = await EpcEnquiry.find(filter);
    console.log('Returned count:', enqs.length);
    console.log('Names:', enqs.map(e => e.customerName).join(', '));
    process.exit(0);
}).catch(console.error);
