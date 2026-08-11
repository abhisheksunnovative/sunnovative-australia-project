import React from "react";
import { Check } from "lucide-react";

const HorizontalStepper = ({ steps, currentStatus, theme = "light" }) => {
  // steps can be an array of strings or objects like { title, info }
  const getStepTitle = (step) => typeof step === 'string' ? step : step.title;
  
  const currentIndex = steps.findIndex(
    (step) => getStepTitle(step).toLowerCase() === currentStatus?.toLowerCase()
  );

  const isDark = theme === "dark";

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Connecting line background */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 rounded-full hidden sm:block z-0 ${isDark ? "bg-slate-800" : "bg-slate-200"}`}></div>

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
              <div key={index} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 sm:w-1/4">
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : isDark
                        ? "bg-orange-600 border-slate-700 text-slate-400"
                        : "bg-white border-slate-300 text-slate-400"
                  } ${isCurrent ? "ring-4 ring-emerald-500/20" : ""}`}
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
                    className={`absolute left-[1.125rem] sm:hidden w-1 ${
                      isCompleted ? "bg-emerald-500" : isDark ? "bg-slate-800" : "bg-slate-200"
                    }`}
                    style={{
                      top: `calc(${index * 100}% / ${steps.length} + 2.5rem)`,
                      height: `calc(100% / ${steps.length - 1} - 2.5rem)`,
                      zIndex: -1,
                    }}
                  ></div>
                )}

                {/* Step Text */}
                <div className="flex flex-col sm:items-center">
                  <span
                    className={`text-sm font-bold sm:text-center ${
                      isCurrent
                        ? (isDark ? "text-white" : "text-slate-900")
                        : isCompleted
                        ? (isDark ? "text-slate-300" : "text-slate-700")
                        : "text-slate-500"
                    }`}
                  >
                    {getStepTitle(step)}
                  </span>
                  {typeof step !== 'string' && step.info && (
                    <span className={`text-[10px] sm:text-center mt-1 hidden sm:block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {step.info}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] sm:text-center font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 w-max">
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
