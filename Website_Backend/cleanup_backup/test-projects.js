import mongoose from 'mongoose';
import { ProjectOrder } from './src/models/ProjectModel.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
  const projects = await ProjectOrder.find({ country: 'india' });
  console.log(`Found ${projects.length} projects for india`);
  if (projects.length > 0) {
    const p = projects[projects.length - 1]; // get latest
    console.log("Latest project type:", p.projectType);
    console.log("Steps count:", p.steps?.length);
    if (p.steps && p.steps.length > 0) {
      console.log("First step title:", p.steps[0].title);
      console.log("All steps titles:", p.steps.map(s => s.title).join(", "));
    }
  }
  process.exit();
}).catch(console.error);
