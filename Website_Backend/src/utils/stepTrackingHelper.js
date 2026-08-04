// Updates the project steps based on a completed step, handling auto-progression and admin approvals
export const processStepCompletion = (project, stepIndex, reqUser, requiresAdminApproval = false) => {
  if (stepIndex === -1 || !project.steps[stepIndex]) return false;

  const currentStep = project.steps[stepIndex];

  // If requires admin approval, set to awaiting-approval instead of completed
  if (requiresAdminApproval) {
    currentStep.status = 'awaiting-approval';
  } else {
    currentStep.status = 'completed';
    currentStep.completedAt = new Date();
    currentStep.completedBy = reqUser || 'System';

    // Move to next step if there is one
    const nextStep = project.steps.find(s => s.stepNumber === currentStep.stepNumber + 1);
    if (nextStep) {
      nextStep.status = 'in-progress';
      nextStep.startedAt = new Date();
      project.currentStepNumber = nextStep.stepNumber;
      project.currentStepTitle = nextStep.title;
    }
  }

  // Recalculate completion percentage based on total payment percentages or equal weight
  let totalSteps = project.steps.length;
  let completedSteps = project.steps.filter(s => s.status === 'completed').length;
  
  if (totalSteps > 0) {
    project.completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  }

  return true;
};
