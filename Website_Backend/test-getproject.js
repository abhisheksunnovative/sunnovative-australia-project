import mongoose from 'mongoose';
import { ProjectOrder } from './src/models/ProjectModel.js';
import EpcEnquiry from './src/models/EpcEnquiry.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  try {
      const projectId = '6a7ebaa...'; // I will get the actual project ID from the DB
      const projects = await ProjectOrder.find().sort({createdAt: -1}).limit(1);
      const project = projects[0];
      if (!project) return console.log('No projects');
      
      console.log("Project found:", project._id);
      
      const resProject = await ProjectOrder.findOne({
        _id: project._id,
      }).populate("recommendedEpcs", "companyName rating totalInstallations contactPerson city state activeDistricts").lean();
      
      console.log("Found project:", resProject._id);

      const enquiry = await EpcEnquiry.findOne({ orderNumber: resProject.orderNumber });
      console.log("Enquiry:", enquiry);
      
      let epcDetails = null;
      if (resProject.assignedEPCId) {
          const { default: EpcPartner } = await import('./src/models/EpcPartner.js');
          const epc = await EpcPartner.findById(resProject.assignedEPCId).select("companyName ownerName contactPerson email mobile phone rating totalInstallations city state address kycDocuments").lean();
          console.log("EPC details found:", epc);
      }
      console.log("Done");
  } catch (err) {
      console.log("Crash:", err);
  }
  process.exit();
});
