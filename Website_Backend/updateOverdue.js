import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Hardcode schema for script
const stepSchema = new mongoose.Schema({
  stepId: String,
  title: String,
  status: String,
  assignedTo: String,
  slaDays: Number,
  startedAt: Date,
  isOverdue: Boolean,
  daysOverdue: Number
}, { strict: false });

const projectSchema = new mongoose.Schema({
  orderNumber: String,
  steps: [stepSchema],
  hasOverdueSteps: Boolean,
  createdAt: Date
}, { strict: false });

const ProjectOrder = mongoose.model('ProjectOrder', projectSchema);

(async () => {
  try {
    console.log("Connecting to", process.env.MONGODB_URL);
    await mongoose.connect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sunnovative");
    const projects = await ProjectOrder.find();
    console.log(`Found ${projects.length} projects`);
    
    let updatedCount = 0;
    for (const p of projects) {
      let changed = false;
      let hasOverdueSteps = false;

      for (let i = 0; i < p.steps.length; i++) {
        const step = p.steps[i];
        if (step.status === 'in-progress' || step.status === 'pending') {
          if (!step.startedAt && step.status === 'in-progress') {
            step.startedAt = p.createdAt;
            changed = true;
          }

          if (step.startedAt && step.slaDays > 0) {
            const diffMs = Date.now() - new Date(step.startedAt).getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const overdue = diffDays - step.slaDays;
            
            if (overdue > 0) {
               step.isOverdue = true;
               step.daysOverdue = overdue;
               hasOverdueSteps = true;
               changed = true;
            } else {
               if (step.isOverdue) {
                   step.isOverdue = false;
                   step.daysOverdue = 0;
                   changed = true;
               }
            }
          }
        }
      }

      if (p.hasOverdueSteps !== hasOverdueSteps) {
        p.hasOverdueSteps = hasOverdueSteps;
        changed = true;
      }

      if (changed) {
        await p.save();
        updatedCount++;
      }
    }
    console.log('Updated ' + updatedCount + ' projects');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
