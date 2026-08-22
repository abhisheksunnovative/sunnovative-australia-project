import React, { useState } from "react";
import { Activity } from "lucide-react";

export default function FeatureTrialConnector({ featureName, description, targetAudience = "Both" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("1 Month");
  const [locationType, setLocationType] = useState("State");
  const [locationName, setLocationName] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4005";

  const handleStartTrial = async () => {
    if (!locationName) return alert("Please enter a location name.");
    setLoading(true);
    try {
      const location = {};
      if (locationType === "State") location.state = locationName;
      if (locationType === "District") location.district = locationName;
      if (locationType === "Country") location.country = locationName;

      const res = await fetch(`${API_BASE}/api/platform-analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName,
          description,
          targetAudience,
          trialDuration: duration,
          status: "Trial",
          location
        })
      });
      if (res.ok) {
        alert(`Trial started successfully for ${locationName}! It will now appear in Platform Analytics.`);
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
        title="Connect to Platform Analytics"
      >
        <Activity className="w-4 h-4" /> Start Feature Trial
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase text-sm">
              Start Trial: {featureName}
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500">{description}</p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trial Scope</label>
                <div className="flex gap-2">
                  {["District", "State", "Country"].map(t => (
                    <button 
                      key={t}
                      onClick={() => setLocationType(t)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded border ${locationType === t ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{locationType} Name</label>
                <input 
                  type="text" 
                  value={locationName} 
                  onChange={e => setLocationName(e.target.value)}
                  placeholder={`e.g. ${locationType === 'State' ? 'Maharashtra' : 'Mumbai'}`}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                />
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
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Trial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
