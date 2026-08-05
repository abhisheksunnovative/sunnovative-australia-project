import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from '../models/Lead.js';
import { ProjectOrder } from '../models/ProjectModel.js';

dotenv.config({ path: 'Website_Backend/.env' });

async function fixSync() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB for Lead/Project sync...");

    // Find jihnathon lead
    const lead = await Lead.findOne({ $or: [{ name: /jihnathon/i }, { mobile: /999999999/ }] });
    // Find latest project order with 99999999
    const project = await ProjectOrder.findOne({ $or: [{ customerMobile: /99999999/ }, { customerName: /Customer|jihnathon/i }] }).sort({ createdAt: -1 });

    if (lead && project) {
      console.log(`Matching Lead ${lead.name} (${lead.mobile}) with Project ${project.orderNumber} (${project.customerMobile})...`);
      
      lead.preferredInstallDate = project.preferredInstallDate || new Date("2026-08-12");
      lead.rooftopPhoto = project.rooftopPhoto;
      lead.consumerNumber = project.consumerNumber || lead.consumerNumber;
      lead.solarType = project.projectType || lead.solarType;
      lead.kw = project.systemSizeKW ? String(project.systemSizeKW) : lead.kw;
      lead.convertedProjectId = project._id;
      
      await lead.save();
      console.log("SUCCESS! Updated Lead with live preferredInstallDate and rooftopPhoto!");
    } else {
      console.log("Lead or Project not found", { lead: !!lead, project: !!project });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixSync();
