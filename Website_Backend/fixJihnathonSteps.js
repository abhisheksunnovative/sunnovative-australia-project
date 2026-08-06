import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const OrderJourneySettings = mongoose.model("OrderJourneySettings", new mongoose.Schema({}, { strict: false }));
  const ProjectOrder = mongoose.model("ProjectOrder", new mongoose.Schema({}, { strict: false }));

  // 1. Fetch the Australia Residential steps
  const journeySettings = await OrderJourneySettings.findOne({ country: "australia", _settingsKey: "australia_all_all" });
  if (!journeySettings) {
    console.error("Australia journey settings not found in database!");
    process.exit(1);
  }

  const resJourney = journeySettings.journeys.find(j => j.projectType === "residential");
  if (!resJourney) {
    console.error("Australia residential journey not found!");
    process.exit(1);
  }

  console.log(`Found Australia residential steps count: ${resJourney.steps.length}`);

  // Map to project steps structure
  const projectSteps = resJourney.steps.map((s, idx) => {
    const allowedRoles = s.allowedRoles && s.allowedRoles.length > 0 
      ? s.allowedRoles 
      : (s.assignedTo === 'customer' ? ['customer', 'bde'] : [s.assignedTo || 'company']);

    return {
      stepId: s.id,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description || "",
      assignedTo: s.assignedTo || 'company',
      allowedRoles,
      canBeCompletedByBDE: s.canBeCompletedByBDE !== false && (s.assignedTo === 'customer' || allowedRoles.includes('bde')),
      milestoneType: s.milestoneType || 'standard',
      paymentPercentage: s.paymentPercentage || 0,
      slaDays: s.slaDays || 2,
      visibleToCustomer: s.visibleToCustomer !== false,
      visibleToEpc: s.visibleToEpc !== false,
      status: idx === 0 ? "in-progress" : "pending",
      completedAt: null,
      completedBy: "",
      evidenceUrl: "",
      evidenceNote: "",
      pendingActionAlert: s.actionLabel || `Complete ${s.title}`,
      isMandatory: s.isMandatory || false,
      requiresAdminApproval: s.requiresAdminApproval || false,
      completionCondition: s.completionCondition || "manual",
      requiresDoc: !!s.requiresDocumentUpload,
      documentRequirements: s.documentRequirements || [],
      requiredActions: s.requiredActions || [],
      uploadedActions: [],
      notificationMedium: s.notificationMedium || ['email']
    };
  });

  // Update Jihnathon's Project
  const order = await ProjectOrder.findOne({ customerName: /jihnathon/i });
  if (!order) {
    console.error("Jihnathon project order not found!");
    process.exit(1);
  }

  console.log(`Updating ProjectOrder for ${order.customerName} (ID: ${order._id})...`);
  order.steps = projectSteps;
  order.currentStepNumber = 1;
  order.currentStepTitle = projectSteps[0].title;
  order.status = projectSteps[0].title; // Initial status
  order.completionPercentage = 0;
  order.pendingActionAlert = projectSteps[0].pendingActionAlert;
  order.pendingActionFor = projectSteps[0].assignedTo;

  await order.save();
  console.log("✨ Jihnathon project order steps successfully reset to premium 12-step Australia residential journey!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error resetting Jihnathon steps:", err);
  process.exit(1);
});
