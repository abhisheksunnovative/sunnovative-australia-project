import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const { ProjectOrder } = await import('./src/models/ProjectModel.js');
  const allOrders = await ProjectOrder.aggregate([
    { $group: { _id: '$customerMobile', ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  for (let grp of allOrders) {
    if (!grp._id) continue;
    const deleteIds = grp.ids.slice(1);
    await ProjectOrder.deleteMany({ _id: { $in: deleteIds } });
    console.log('Deleted duplicates for mobile:', grp._id, 'Count:', deleteIds.length);
  }
  process.exit();
}).catch(console.error);
