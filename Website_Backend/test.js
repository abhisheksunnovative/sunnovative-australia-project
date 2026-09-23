import 'dotenv/config';
import mongoose from 'mongoose';
import { ProjectOrder } from './src/models/ProjectModel.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  const proj = await ProjectOrder.findOne({
    $or: [
      { customerId: "nonexistent" },
      { customerMobile: undefined }
    ]
  });
  
  console.log("Found project:", proj ? proj.orderNumber : "Not found");
  process.exit(0);
}

run();
