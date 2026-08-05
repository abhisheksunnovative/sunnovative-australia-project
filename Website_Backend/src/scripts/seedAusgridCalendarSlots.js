import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const EpcPartner = mongoose.model('EpcPartner', new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model('ProjectOrder', new mongoose.Schema({}, { strict: false }));
  const EpcCalendar = mongoose.model('EpcCalendar', new mongoose.Schema({}, { strict: false }));

  const ausgrid = await EpcPartner.findOne({ companyName: /ausgrid/i });
  if (!ausgrid) {
    console.error('Ausgrid EPC not found');
    process.exit(1);
  }

  const po = await ProjectOrder.findOne({ orderNumber: 'SUN-2026-9313' });
  if (po) {
    po.assignedEPCId = ausgrid._id.toString();
    po.assignedEPCName = ausgrid.companyName;
    po.isInstallDateFixed = true;
    po.preferredInstallDate = new Date('2026-08-12T09:00:00.000Z');
    await po.save();
    console.log('Linked SUN-2026-9313 to Ausgrid EPC on 12/08/2026!');
  }

  // Generate slots for August 2026 (days 1 to 31)
  const slots = [];
  const district = ausgrid.activeDistricts?.[0] || 'Sydney';
  const projectType = 'residential';

  for (let day = 1; day <= 31; day++) {
    const slotDate = new Date(2026, 7, day); // Aug 2026
    const isBooked = (day === 12); // 12th Aug is booked for SUN-2026-9313 (Jihnathon)

    slots.push({
      epcPartner: ausgrid._id,
      projectType,
      district,
      date: slotDate,
      maxBookings: 1,
      currentBookings: isBooked ? 1 : 0,
      isAvailable: !isBooked,
      isBlocked: isBooked,
      notes: isBooked ? 'Order #SUN-2026-9313 (Jihnathon)' : 'Open Slot'
    });
  }

  await EpcCalendar.deleteMany({ epcPartner: ausgrid._id });
  const createdSlots = await EpcCalendar.insertMany(slots);
  console.log(`Created ${createdSlots.length} calendar slots for Ausgrid Solar Solutions!`);

  console.log('✨ Calendar seed complete!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
