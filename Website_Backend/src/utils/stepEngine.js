import { calculateSTC } from './stcCalculator.js';
export const calcCompletion = (steps) => {
  if (!steps || steps.length === 0) return 0;
  let comp = 0;
  steps.forEach((s) => {
    if (s.status === "completed") comp++;
  });
  return Math.round((comp / steps.length) * 100);
};

export const findJourneySettings = async (country, state, district) => {
  const { OrderJourneySettings } = await import('../models/OrderJourneySettings.js');
  let searchCountry = (country || 'india').toLowerCase().trim();
  if (searchCountry === 'au') searchCountry = 'australia';
  if (searchCountry === 'in') searchCountry = 'india';

  let doc = await OrderJourneySettings.findOne({
    country: searchCountry,
    state: state || 'all',
    district: district || 'all'
  });

  if (!doc && (state || district)) {
    doc = await OrderJourneySettings.findOne({
      country: searchCountry,
      state: 'all',
      district: 'all'
    });
  }

  if (!doc) {
    doc = await OrderJourneySettings.findOne({ country: searchCountry, state: 'all', district: 'all' });
  }

  // If still no doc found, we must return null or an empty document instead of crossing countries.
  if (!doc) {
    return null;
  }

  return doc;
};

/**
 * Standardize mapping from OrderJourneySettings step to ProjectOrder step
 */
export const mapJourneyStepsToProjectSteps = (journeySteps = []) => {
  return journeySteps
    .filter((s) => s.enabled)
    .map((s) => {
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
        status: "pending",
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
        notificationMedium: s.notificationMedium || ['email'],
        notifyCustomer: s.notifyCustomer !== false,
        notifyEPC: s.notifyEPC || false,
        notifyAdmin: s.notifyAdmin || false
      };
    });
};

export const getStatusFromSteps = (steps, completionPercentage) => {
  if (completionPercentage === 100) return "completed";
  const hasInProgress = steps.some((s) => s.status === "in-progress" || s.status === "awaiting-approval");
  if (hasInProgress) return "in-progress";
  return "pending";
};

// -- AU STC Zone and Value Calculator --
const getAuStcZone = (postcode) => {
  const code = parseInt(postcode, 10);
  if (!code) return 3;
  if ((code >= 800 && code <= 899) || (code >= 4700 && code <= 4899) || (code >= 6700 && code <= 6799)) return 1;
  if ((code >= 4300 && code <= 4699) || (code >= 6600 && code <= 6699)) return 2;
  if ((code >= 7000 && code <= 7999) || code === 2627 || code === 2628) return 4;
  return 3;
};

/**
 * Shared engine for completing a project step.
 * Used by Customer, BDE, EPC, and Admin.
 *
 * @param {Object} order - The ProjectOrder mongoose document
 * @param {String} stepId - The ID of the step to complete
 * @param {String} completedBy - Who is completing this (Customer, BDE, Admin, etc.)
 * @param {String} finalUrl - Evidence URL (if any)
 * @param {String} finalNote - Evidence Note (if any)
 * @param {String} executorRole - Role of the executor ('customer', 'epc-partner', 'company', 'bde')
 * @returns {Object} { success, message, order, nextStep }
 */
export const processStepCompletionEngine = async (
  order,
  stepId,
  completedBy = "System",
  finalUrl = "",
  finalNote = "",
  executorRole = "",
  uploadedActions = []
) => {
  // Step dhundho
  const stepIndex = order.steps.findIndex((s) => s.stepId === stepId);
  if (stepIndex === -1) {
    return { success: false, message: "Step nahi mila" };
  }

  const step = order.steps[stepIndex];

  if (step.status === "completed") {
    return { success: false, message: "Step already completed hai" };
  }

  // Strict Role Check Enforcement
  if (executorRole && executorRole !== "company" && executorRole !== "Admin") {
    const roles = step.allowedRoles?.length > 0 ? step.allowedRoles : [step.assignedTo];
    const isBdeAllowed = executorRole === "bde" && (step.assignedTo === "customer" || step.canBeCompletedByBDE || roles.includes("bde"));
    const isDirectAllowed = roles.includes(executorRole) || step.assignedTo === executorRole;

    if (!isDirectAllowed && !isBdeAllowed) {
      return {
        success: false,
        message: `Permission Denied: Step "${step.title}" is restricted. Only [${roles.join(', ')}] are authorized to execute this step.`
      };
    }
  }

  // Handle Admin Approval Flow
  const requiresAdminApproval = step.requiresAdminApproval && completedBy !== "Admin";
  const newStatus = requiresAdminApproval ? "awaiting-approval" : "completed";

  // Step complete karo
  order.steps[stepIndex].status = newStatus;
  
  let dynamicEvidenceNote = finalNote;
  
  // Trigger STC calculations for Australia Step 1
  if (stepId === "au-res-step-1" && newStatus === "completed" && uploadedActions && uploadedActions.length > 0) {
    const postcodeObj = uploadedActions.find(a => a.label && a.label.toLowerCase().includes("postcode"));
    const billObj = uploadedActions.find(a => a.label && a.label.toLowerCase().includes("bill"));
    
    if (postcodeObj && postcodeObj.value) {
      const postcode = postcodeObj.value.trim();
      const zone = getAuStcZone(postcode);
      const systemSize = order.systemSizeKW || 6.6;
      
      const stcResult = calculateSTC(systemSize, zone, new Date().getFullYear(), 38);
      const installCost = Math.round(systemSize * 1200); // basic fallback estimate
      const netCost = Math.max(500, installCost - stcResult.totalRebate);
      
      order.estimatedSubsidy = stcResult.totalRebate;
      order.totalProjectCost = netCost;
      if (billObj && billObj.value) {
        const billVal = parseFloat(billObj.value.replace(/[^0-9.]/g, "")) || 0;
        order.monthlyBillAmount = billVal;
      }
      
      const calcSummary = `[Auto-Calc: Postcode ${postcode} resolved to Zone ${zone}. System Size: ${systemSize}kW. Estimated STC Rebate: $${stcResult.totalRebate}. Net Project Cost: $${netCost}]`;
      dynamicEvidenceNote = (dynamicEvidenceNote ? dynamicEvidenceNote + " | " : "") + calcSummary;
    }
  }

  if (newStatus === "completed") {
    order.steps[stepIndex].completedAt = new Date();
    
    const formattedDate = new Date().toLocaleString("en-IN");
    const logStr = `\n\n[✓ Completed by ${completedBy} on ${formattedDate}. Action Details: ${dynamicEvidenceNote || 'Completed successfully'}]`;
    if (!order.steps[stepIndex].description.includes("[✓ Completed by")) {
      order.steps[stepIndex].description += logStr;
    }
  }
  order.steps[stepIndex].completedBy = completedBy;
  order.steps[stepIndex].evidenceUrl = finalUrl || order.steps[stepIndex].evidenceUrl;
  order.steps[stepIndex].evidenceNote = dynamicEvidenceNote || order.steps[stepIndex].evidenceNote;
  if (uploadedActions && uploadedActions.length > 0) {
    order.steps[stepIndex].uploadedActions = uploadedActions;
  }
  order.steps[stepIndex].pendingActionAlert = "";

  let nextStep = null;

  // If awaiting approval, DO NOT activate the next step yet.
  if (newStatus === "awaiting-approval") {
    order.pendingActionAlert = `Waiting for Admin approval on ${step.title}`;
    order.pendingActionFor = "company";
  } else {
    // Next pending step dhundho
    nextStep = order.steps.find((s, i) => i > stepIndex && s.status === "pending");

    // Update current step info
    if (nextStep) {
      const nextStepIndex = order.steps.findIndex((s) => s.stepId === nextStep.stepId);
      if (nextStepIndex !== -1) {
        order.steps[nextStepIndex].status = "in-progress";
        order.steps[nextStepIndex].startedAt = new Date();
      }

      order.currentStepNumber = nextStep.stepNumber;
      order.currentStepTitle = nextStep.title;
      order.pendingActionAlert = nextStep.pendingActionAlert || `${nextStep.title} complete karo`;
      order.pendingActionFor = nextStep.assignedTo;
    } else {
      order.status = "completed";
      order.completionPercentage = 100;
      order.pendingActionAlert = "";
      order.pendingActionFor = "none";
    }
  }

  // Recalculate completion %
  order.completionPercentage = calcCompletion(order.steps);

  // Update overall status
  order.status = getStatusFromSteps(order.steps, order.completionPercentage);
  order.lastActivityAt = new Date();

  // Trigger In-App Notification Alerts dynamically based on Step Settings
  try {
    const { default: Notification } = await import('../models/Notification.js');
    
    const title = `Step Update: ${step.title}`;
    const statusText = newStatus === 'awaiting-approval' ? 'Awaiting Approval' : 'Completed';
    const message = `Step "${step.title}" of project #${order.orderNumber || ''} (${order.customerName || 'Customer'}) has been updated to "${statusText}" by ${completedBy}.`;
    
    // 1. Notify Customer
    if (step.notifyCustomer && order.customerId) {
      await Notification.create({
        role: "Customer",
        recipientId: order.customerId,
        title,
        message,
        projectId: order._id
      });
      console.log(`[In-App Notification] Created for Customer regarding step: ${step.title}`);
    }
    
    // 2. Notify EPC Partner
    if (step.notifyEPC && order.assignedEPCId) {
      await Notification.create({
        role: "EpcPartner",
        recipientId: order.assignedEPCId,
        title,
        message,
        projectId: order._id
      });
      console.log(`[In-App Notification] Created for EPC Partner regarding step: ${step.title}`);
    }
    
    // 3. Notify Admin
    if (step.notifyAdmin || step.requiresAdminApproval) {
      await Notification.create({
        role: "Admin",
        recipientId: null,
        title,
        message,
        projectId: order._id
      });
      console.log(`[In-App Notification] Created for Admin regarding step: ${step.title}`);
    }
  } catch (nErr) {
    console.error("Step completion notification trigger error:", nErr);
  }

  return { success: true, message: `Step "${step.title}" updated`, order, nextStep, newStatus };
};

// 1. Admin note add/update karo — step complete kiye bina
export const addAdminNoteToStep = async (order, stepId, note, adminName = "Admin") => {
  const step = order.steps.find(s => s.stepId === stepId);
  if (!step) return { success: false, message: "Step nahi mila" };
  step.adminNote = note;
  step.adminNoteBy = adminName;
  step.adminNoteAt = new Date();
  await order.save();
  return { success: true, order };
};

// 2. Admin reupload request kare (doc reject)
export const requestStepReupload = async (order, stepId, reason, adminName = "Admin") => {
  const step = order.steps.find(s => s.stepId === stepId);
  if (!step) return { success: false, message: "Step nahi mila" };
  step.reuploadRequested = true;
  step.reuploadReason = reason;
  step.status = "in-progress";
  step.completedAt = null;
  step.evidenceUrl = "";
  order.pendingActionAlert = `Reupload needed: ${step.title} — ${reason}`;
  order.pendingActionFor = step.assignedTo;
  await order.save();
  return { success: true, order };
};

// 3. Admin step edit kare (sla/assignedTo/title jaisi cheezein)
export const editStepDetails = async (order, stepId, updates, adminName = "Admin") => {
  const step = order.steps.find(s => s.stepId === stepId);
  if (!step) return { success: false, message: "Step nahi mila" };
  const allowedFields = ["title", "description", "assignedTo", "slaDays", "requiresAdminApproval", "isMandatory", "canBeCompletedByBDE"];
  allowedFields.forEach(f => { if (updates[f] !== undefined) step[f] = updates[f]; });
  step.adminNote = (step.adminNote ? step.adminNote + " | " : "") + `Edited by ${adminName}`;
  await order.save();
  return { success: true, order };
};

// 4. BDE customer ki taraf se step complete kare (sirf allowed steps)
export const completeStepOnBehalfOfCustomer = async (order, stepId, bdeName = "BDE", evidenceUrl = "", note = "", uploadedActions = []) => {
  const step = order.steps.find(s => s.stepId === stepId);
  if (!step) return { success: false, message: "Step nahi mila" };
  if (step.assignedTo !== "customer") return { success: false, message: "Ye customer ka step nahi hai" };
  if (!step.canBeCompletedByBDE) return { success: false, message: "Is step ko BDE customer ki taraf se nahi kar sakta" };
  return processStepCompletionEngine(order, stepId, `BDE (on behalf of customer) — ${bdeName}`, evidenceUrl, note, "bde", uploadedActions);
};
