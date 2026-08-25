import React, { useState, createContext, useContext } from "react";
import { Activity } from "lucide-react";
import { useGeography } from "../hooks/useGeography";

export const FeatureTrialContext = createContext(null);

export function useFeatureTrial() {
  return useContext(FeatureTrialContext);
}

export default function FeatureTrialConnector({ 
  featureName, 
  description, 
  targetAudience = "Both", 
  preSelectedCountry,
  children,
  isLocked = false,
  activeFeatureId = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [duration, setDuration] = useState("1 Month");
  const [locationType, setLocationType] = useState("State");
  
  const [country, setCountry] = useState(preSelectedCountry || "");
  const [impactTarget, setImpactTarget] = useState("Customer Conversion");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");

  const { states, districts } = useGeography(country, stateName);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const handleStartTrial = async () => {
    if (!country) return alert("Please select a Country first.");
    if (locationType === "State" && !stateName) return alert("Please select a State.");
    if (locationType === "District" && (!stateName || !districtName)) return alert("Please select a State and District.");
    
    setLoading(true);
    try {
      const location = { country };
      if (locationType === "State" || locationType === "District") location.state = stateName;
      if (locationType === "District") location.district = districtName;

      const res = await fetch(API_BASE + "/api/platform-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName,
          description,
          targetAudience,
          impactTarget,
          trialDuration: duration,
          status: "Trial",
          location
        })
      });
      if (res.ok) {
        alert("Trial started successfully! It will now appear in Platform Analytics.");
        setIsOpen(false);
      } else {
        alert("Failed to start trial.");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting trial.");
    }
    setLoading(false);
  };

  const trackUsage = () => {
    if (activeFeatureId) {
      fetch(API_BASE + "/api/platform-analytics/" + activeFeatureId + "/track-click", { method: "POST" })
        .catch(e => console.error(e));
    }
  };

  const content = children ? (
    <FeatureTrialContext.Provider value={activeFeatureId}>
      <div onClickCapture={trackUsage} className="relative group">
        {isLocked && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl p-4">
             <Activity className="w-8 h-8 text-indigo-400 mb-2" />
             <p className="text-sm font-black text-indigo-900 text-center mb-1">{featureName}</p>
             <p className="text-xs text-indigo-600 text-center mb-3">Locked. Needs trial activation.</p>
             <button 
               onClick={() => setIsOpen(true)}
               className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition"
             >
               Start Trial
             </button>
          </div>
        )}
        <div className={isLocked ? "opacity-30 pointer-events-none" : ""}>
          {children}
        </div>
      </div>
    </FeatureTrialContext.Provider>
  ) : (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
      title="Connect to Platform Analytics"
    >
      <Activity className="w-4 h-4" /> Start Trial
    </button>
  );

  return (
    <>
      {content}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Start Trial: {featureName}
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500">{description}</p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trial Scope</label>
                <div className="flex gap-2">
                  {["District", "State"].map(t => (
                    <button 
                      key={t}
                      onClick={() => setLocationType(t)}
                      className={"flex-1 py-1.5 text-xs font-bold rounded border " + (locationType === t ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              

              {(locationType === "State" || locationType === "District") && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                  <select value={stateName} onChange={e => { setStateName(e.target.value); setDistrictName(""); }} className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500" >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {locationType === "District" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">District</label>
                  <select value={districtName} onChange={e => setDistrictName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500" disabled={!stateName}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Impact Target</label>
                <select 
                  value={impactTarget} 
                  onChange={e => setImpactTarget(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500 mb-4"
                >
                  <option value="Customer Conversion">Customer Conversion</option>
                  <option value="EPC Engagement">EPC Engagement</option>
                  <option value="Internal Operations">Internal Operations</option>
                  <option value="Customers Gained">Customers Gained</option>
                  <option value="EPCs Gained">EPCs Gained</option>
                  <option value="Overdue Management">Overdue Management</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trial Duration</label>
                <select 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                >
                  <option value="1 Week">1 Week</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>

            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartTrial}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Starting..." : <><Activity className="w-4 h-4"/> Start Trial</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
