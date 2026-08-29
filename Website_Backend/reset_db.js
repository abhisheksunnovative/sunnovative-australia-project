import('./src/config/db.js').then(async (m) => {
    await m.connectDB();
    const mongoose = (await import('mongoose')).default;
    const EpcEnquiry = mongoose.model('EpcEnquiry', new mongoose.Schema({}, { strict: false }));
    const result = await EpcEnquiry.updateMany(
        { customerMobile: '9870761233' },
        { $set: { status: 'Open For EPC' }, $unset: { acceptedAt: 1 } }
    );
    console.log('Updated enquiries:', result);
    process.exit(0);
}).catch(console.error);
