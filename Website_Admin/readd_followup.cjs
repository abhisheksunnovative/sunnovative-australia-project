const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

// I will insert the Follow-Up Date picker right above the Actions (Lead Details button).
const targetStr = '<button \n                  onClick={() => setViewingDetailLead(lead)} \n                  className="w-full justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center gap-2 shadow-sm"\n                >\n                  <ShieldCheck className="w-4 h-4 text-blue-500"/> Lead Details\n                </button>';

const replacementStr = `<div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm mb-1">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> Follow-up Date
                    </div>
                    <input 
                      type="date" 
                      className="bg-transparent border-none p-0 text-xs font-bold text-blue-700 cursor-pointer focus:ring-0"
                      value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                      onChange={(e) => updateLeadStatus(lead._id, lead.status, e.target.value)}
                    />
                  </div>
                </div>

                ${targetStr}`;

if (c.includes(targetStr)) {
  c = c.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
  console.log("Re-added follow-up date picker!");
} else {
  console.log("Could not find Lead Details button to anchor before.");
}
