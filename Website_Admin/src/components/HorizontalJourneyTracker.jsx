import React from "react";
import { Check, XCircle } from "lucide-react";

export default function HorizontalJourneyTracker({ steps }) {
  const displaySteps = steps?.length > 0 ? steps : [
    { stepNumber: 1, title: 'Lead Captured', status: 'completed' },
    { stepNumber: 2, title: 'EPC Assigned', status: 'pending' },
    { stepNumber: 3, title: 'Site Survey', status: 'pending' },
    { stepNumber: 4, title: 'Installation', status: 'pending' },
    { stepNumber: 5, title: 'Completed', status: 'pending' }
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="min-w-[600px] flex items-start justify-between relative mt-4 px-4">
        {/* Background track line */}
        <div className="absolute left-10 right-10 top-5 h-1 bg-slate-200 -z-10" />
        
        {displaySteps.map((step, i) => {
          const done = step.status === "completed";
          const active = step.status === "in-progress" || step.status === "pending"; 
          const reallyActive = step.status === "in-progress" || (step.status === "pending" && (i === 0 || displaySteps[i-1]?.status === "completed"));
          const blocked = step.status === "blocked";
          
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative group cursor-default">
              {/* Colored track line (if completed) */}
              {i > 0 && (done || reallyActive) && (
                <div className={`absolute right-[50%] left-[-50%] top-5 h-1 -z-10 transition-all ${done || reallyActive ? 'bg-orange-400' : 'bg-slate-200'}`} />
              )}
              
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-4 ring-white mb-2 transition-all ${
                done ? "bg-orange-500 text-white shadow-md" : 
                reallyActive ? "bg-amber-400 text-white shadow-md ring-amber-50" : 
                blocked ? "bg-red-500 text-white shadow-md" : 
                "bg-slate-200 text-slate-400"
              }`}>
                {done ? <Check className="w-5 h-5" /> : 
                 blocked ? <XCircle className="w-5 h-5" /> : 
                 <span className={reallyActive ? "text-white" : ""}>{step.stepNumber || (i+1)}</span>}
              </div>
              
              {/* Title */}
              <p className={`text-xs text-center font-bold px-2 max-w-[120px] ${
                done ? "text-slate-800" : 
                reallyActive ? "text-amber-700" : 
                "text-slate-400"
              }`}>
                {step.title}
              </p>

              {/* Assignments / Dates */}
              {step.assignedTo && (
                <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                  step.assignedTo === "epc-partner" ? "bg-purple-100 text-purple-700" :
                  step.assignedTo === "customer" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {step.assignedTo === "epc-partner" ? "⚡ EPC" : step.assignedTo === "customer" ? "👤 Customer" : "🏢 Us"}
                </span>
              )}
              
              {step.completedAt && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(step.completedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                </p>
              )}
              {step.pendingActionAlert && reallyActive && (
                <p className="text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded mt-1 font-bold text-center leading-tight max-w-[110px]">
                  {step.pendingActionAlert}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
