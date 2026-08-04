export const getStepColors = (step) => {
  if (step.status === "completed") {
    return { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-emerald-700", fill: "bg-emerald-500" };
  }
  
  if (step.status === "awaiting-approval") {
    return { bg: "bg-yellow-400", border: "border-yellow-500", text: "text-yellow-800", fill: "bg-yellow-400" };
  }
  
  if (step.status === "blocked") {
    return { bg: "bg-red-500", border: "border-red-600", text: "text-red-700", fill: "bg-red-500" };
  }
  
  if (step.status === "in-progress") {
    if (step.assignedTo === "customer") {
      return { bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-700", fill: "bg-blue-500" };
    }
    if (step.assignedTo === "epc-partner") {
      return { bg: "bg-orange-500", border: "border-orange-600", text: "text-orange-700", fill: "bg-orange-500" };
    }
    return { bg: "bg-slate-700", border: "border-slate-800", text: "text-slate-800", fill: "bg-slate-700" };
  }
  
  // pending
  return { bg: "bg-white", border: "border-slate-300", text: "text-slate-400", fill: "bg-slate-200" };
};
