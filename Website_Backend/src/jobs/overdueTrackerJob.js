import { ProjectOrder } from "../models/ProjectModel.js";
import { OrderJourneySettings } from "../models/OrderJourneySettings.js";

// Helper to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const scheduleOverdueTrackerJob = () => {
  // Run every 4 hours (adjust as needed, e.g. 1000 * 60 * 60 * 4)
  const INTERVAL = 1000 * 60 * 60 * 4; 
  
  setInterval(async () => {
    console.log("[Overdue Tracker] Starting overdue check...");
    try {
      const orders = await ProjectOrder.find({ 
        status: { $nin: ["Project Completed", "cancelled", "closed", "Warranty Activated"] } 
      });

      const allSettings = await OrderJourneySettings.find();
      if (!allSettings || allSettings.length === 0) {
        return;
      }

      let updatedCount = 0;

      for (const order of orders) {
        let orderUpdated = false;
        let hasOverdueSteps = false;

        let searchCountry = (order.country || 'india').toLowerCase().trim();
        if (searchCountry === 'au') searchCountry = 'australia';
        if (searchCountry === 'in') searchCountry = 'india';

        const journeySettingsObj = allSettings.find(s => s.country === searchCountry) || allSettings.find(s => s.country === 'india');
        if (!journeySettingsObj || !journeySettingsObj.journeys) continue;

        const journey = journeySettingsObj.journeys.find(j => j.projectType === order.projectType);
        if (!journey) continue;

        for (let i = 0; i < order.steps.length; i++) {
          const step = order.steps[i];
          if (step.status === "in-progress" || (step.status === "pending" && order.currentStepNumber === step.stepNumber)) {
            // Find settings for this step
            const stepSettings = journey.steps.find(s => s.id === step.stepId);
            if (!stepSettings) continue;

            const slaDays = stepSettings.slaDays || stepSettings.estimatedDays || 1;
            const warningDays = stepSettings.warningDays || 0;
            const redAlertDays = stepSettings.redAlertDays || 0;

            if (step.startedAt) {
              const now = new Date();
              const diffTime = Math.abs(now - new Date(step.startedAt));
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > slaDays) {
                if (!step.isOverdue || step.daysOverdue !== (diffDays - slaDays)) {
                  step.isOverdue = true;
                  step.daysOverdue = diffDays - slaDays;
                  orderUpdated = true;
                  hasOverdueSteps = true;

                  if (redAlertDays > 0 && step.daysOverdue >= redAlertDays && !step.isCritical) {
                    step.isCritical = true;
                  }
                  
                  // In a real app, send email/sms if stepSettings.autoNotifyOverdue is true
                }
              }
            } else {
               // set startedAt if missing
               step.startedAt = new Date();
               orderUpdated = true;
            }
          }
        }

        if (order.hasOverdueSteps !== hasOverdueSteps) {
          order.hasOverdueSteps = hasOverdueSteps;
          orderUpdated = true;
        }

        if (orderUpdated) {
          await order.save();
          updatedCount++;
        }
      }

      console.log(`[Overdue Tracker] Checked ${orders.length} active orders, updated ${updatedCount} overdue statuses.`);
    } catch (err) {
      console.error("[Overdue Tracker] Error:", err);
    }
  }, INTERVAL);

  console.log("Scheduled Overdue Tracker Job (runs every 4 hours)");
};
