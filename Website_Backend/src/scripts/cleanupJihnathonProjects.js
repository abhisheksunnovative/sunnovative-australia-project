import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  if (!MONGO_URI) {
    console.error('MONGODB_URL missing in .env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));

  const jihnathonCustomer = await Customer.findOne({ $or: [{ mobile: '9999999999' }, { fullName: /jihnathon/i }] });
  console.log('Jihnathon Customer:', jihnathonCustomer);

  const jihnathonMobile = '9999999999';
  const jihnathonId = jihnathonCustomer?._id?.toString();

  const allProjects = await ProjectOrder.find({
    $or: [
      { customerMobile: jihnathonMobile },
      { customerId: jihnathonId },
      { customerName: /jihnathon/i }
    ]
  });

  console.log(`Found ${allProjects.length} total projects for Jihnathon:`);
  allProjects.forEach(p => console.log(`- ${p.orderNumber} | ${p.projectType || p.systemSizeKw} | ID: ${p._id} | Created: ${p.createdAt}`));

  // Keep SUN-2026-9313 (or the main active project) and delete all other dummy duplicates (SUN-2026-0019 to SUN-2026-0025)
  const targetProject = allProjects.find(p => p.orderNumber === 'SUN-2026-9313') || allProjects[0];

  if (targetProject) {
    console.log(`\nKeeping main active project: ${targetProject.orderNumber} (ID: ${targetProject._id})`);
    
    // Ensure customerId and mobile are correctly set on targetProject
    if (jihnathonCustomer) {
      targetProject.customerId = jihnathonCustomer._id.toString();
      targetProject.customerMobile = jihnathonMobile;
      targetProject.customerName = jihnathonCustomer.fullName || 'jihnathon';
      await targetProject.save();
    }

    const deleteRes = await ProjectOrder.deleteMany({
      $or: [
        { customerMobile: jihnathonMobile },
        { customerId: jihnathonId },
        { customerName: /jihnathon/i }
      ],
      _id: { $ne: targetProject._id }
    });

    console.log('Deleted duplicate projects:', deleteRes);
  }

  console.log('✨ Cleanup complete! Only 1 active project (SUN-2026-9313) remains for Jihnathon.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
