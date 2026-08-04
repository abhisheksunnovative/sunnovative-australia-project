export const calcCompletion = (steps) => {
  if (!steps || steps.length === 0) return 0;
  let comp = 0;
  steps.forEach((s) => {
    if (s.status === "completed") comp++;
  });
  return Math.round((comp / steps.length) * 100);
};

/**
 * Standardize mapping from OrderJourneySettings step to ProjectOrder step
 */
export const mapJourneyStepsToProjectSteps = (journeySteps = []) => {
  return journeySteps
    .filter((s) => s.enabled)
    .map((s) => ({
      stepId: s.id,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description || "",
      assignedTo: s.assignedTo || 'company',
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
      notificationMedium: s.notificationMedium || ['email']
    }));
};

export const getStatusFromSteps = (steps, completionPercentage) => {
  if (completionPercentage === 100) return "completed";
  const hasInProgress = steps.some((s) => s.status === "in-progress" || s.status === "awaiting-approval");
  if (hasInProgress) return "in-progress";
  return "pending";
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
 * @returns {Object} { success, message, order, nextStep }
 */
export const processStepCompletionEngine = async (
  order,
  stepId,
  completedBy = "System",
  finalUrl = "",
  finalNote = ""
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

  // Handle Admin Approval Flow
  const requiresAdminApproval = step.requiresAdminApproval && completedBy !== "Admin";
  const newStatus = requiresAdminApproval ? "awaiting-approval" : "completed";

  // Step complete karo
  order.steps[stepIndex].status = newStatus;
  if (newStatus === "completed") {
    order.steps[stepIndex].completedAt = new Date();
  }
  order.steps[stepIndex].completedBy = completedBy;
  order.steps[stepIndex].evidenceUrl = finalUrl || order.steps[stepIndex].evidenceUrl;
  order.steps[stepIndex].evidenceNote = finalNote || order.steps[stepIndex].evidenceNote;
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

  return { success: true, message: `Step "${step.title}" updated`, order, nextStep, newStatus };
};
