import React from "react";
import { Check, Clock, X } from "lucide-react";

const HorizontalStepper = ({ steps, currentStatus }) => {
  // steps is an array of strings representing status in order
  // e.g., ["Lead Generated", "Assigned to EPC", "Site Survey Done", "STC Approved", "Installation Complete"]
  const currentIndex = steps.findIndex(
    (step) => step.toLowerCase() === currentStatus?.toLowerCase()
  );

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting line background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full hidden sm:block z-0"></div>

        {/* Active connecting line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-500 ease-in-out hidden sm:block z-0"
          style={{ width: `${currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%` }}
        ></div>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row w-full justify-between relative z-10 gap-6 sm:gap-0">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={index} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 sm:w-1/4">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-white border-slate-300 text-slate-400"
                  } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Vertical Line for Mobile */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[1.15rem] top-10 bottom-0 w-1 sm:hidden ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                    style={{
                      height: "calc(100% + 1.5rem)", // Connect to next step
                      zIndex: -1,
                    }}
                  ></div>
                )}

                {/* Step Text */}
                <div className="flex flex-col sm:items-center">
                  <span
                    className={`text-sm font-bold sm:text-center ${
                      isCurrent
                        ? "text-slate-900"
                        : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] sm:text-center font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizontalStepper;
