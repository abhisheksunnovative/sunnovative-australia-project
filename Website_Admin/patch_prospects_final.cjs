const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix filteredLeads and add getCountForProjectType
const oldFiltered = `  const filteredLeads = leads.filter(l => {
    const isProspect = l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;
    if (!isProspect) return false;

    if (projectTypeFilter !== "All" && l.solarType !== projectTypeFilter) return false;`;

const newFiltered = `  const baseProspects = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    return l.installDateBooked && !isEligibleForOrderJourney;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return baseProspects.length;
    return baseProspects.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const filteredLeads = baseProspects.filter(l => {
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;`;

if (code.includes('const isProspect = l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;')) {
  code = code.replace(oldFiltered, newFiltered);
  console.log("Patched filteredLeads");
} else {
  console.log("Could not find filteredLeads block");
}

// 2. Replace the projectType select with Cards
const selectRegex = /<select value=\{projectTypeFilter\} onChange=\{\(e\) => setProjectTypeFilter\(e\.target\.value\)\}[\s\S]*?<\/select>|<select value=\{projectTypeFilter\} onChange=\{e => setProjectTypeFilter\(e\.target\.value\)\}[\s\S]*?<\/select>/;

const cardsCode = `{/* Project Type Filter Cards */}
      <div className="w-full flex gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        <button 
          onClick={() => setProjectTypeFilter("All")}
          className={\`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 \${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}\`}
        >
          All Types
          <span className={\`px-1.5 py-0.5 rounded-md text-[10px] font-black \${projectTypeFilter === 'All' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}\`}>{getCountForProjectType("All")}</span>
        </button>
        {dynamicProjectTypes.map(pt => {
          const ptCount = getCountForProjectType(pt.value);
          if (ptCount === 0 && projectTypeFilter !== pt.value) return null;
          return (
            <button 
              key={pt.value}
              onClick={() => setProjectTypeFilter(pt.value)}
              className={\`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 \${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}\`}
            >
              {pt.label}
              <span className={\`px-1.5 py-0.5 rounded-md text-[10px] font-black \${projectTypeFilter === pt.value ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}\`}>{ptCount}</span>
            </button>
          )
        })}
      </div>`;

if (code.match(selectRegex)) {
  code = code.replace(selectRegex, cardsCode);
  console.log("Patched cards");
} else {
  console.log("Could not find select dropdown");
}

// 3. Replace Token Logic Block
const tokenRegex = /\{\/\* Move to Order Journey \/ Token Payment \*\/\}(.|\n)*?(?=<\/div>\s*<\/div>\s*<\/div>\s*\)\)\s*\}|Converted to Order)/;
// Wait, the regex might be tricky. Let's just use exact text if possible.
const oldTokenBlock = `{/* Move to Order Journey / Token Payment */}
                <div className="flex flex-col gap-2 mt-2">
                  {!lead.tokenPaid ? (
                    <>
                      <p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to pay token</p>
                      <button onClick={() => handleSimulatePayment(lead)} className="text-[10px] text-blue-600 font-bold underline text-center mt-1">Simulate Token Payment</button>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold text-emerald-600 text-center uppercase">Token Paid</p>
                      <button disabled className="w-full py-2.5 bg-slate-300 text-slate-500 cursor-not-allowed text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Go to Order Journey
                      </button>
                      <button onClick={() => handleSimulatePayment(lead)} className="text-[10px] text-blue-600 underline text-center mt-1">Simulate Token Payment</button>
                    </>
                  )}`;

const newTokenBlock = `{/* Move to Order Journey / Token Payment */}
                <div className="flex flex-col gap-2 mt-2">
                  {/* Follow-up Date Editor */}
                  <div className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col gap-1 shadow-sm mb-1">
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> Follow-up Date
                      </div>
                      <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-[10px] font-bold text-blue-700 cursor-pointer focus:ring-0"
                        value={lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""}
                        onChange={async (e) => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/status\`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
                              body: JSON.stringify({ status: lead.status, nextFollowUp: e.target.value })
                            });
                            if (res.ok) { fetchLeads(); }
                          } catch (err) {}
                        }}
                      />
                    </div>
                  </div>

                  {!isAU ? (
                    lead.tokenPaid ? (
                      <p className="text-[10px] font-bold text-emerald-600 text-center uppercase bg-emerald-50 py-2 rounded border border-emerald-100">Token Paid. Waiting for EPC.</p>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-rose-600 text-center uppercase bg-rose-50 border border-rose-200 py-1.5 rounded shadow-sm">Ask customer to pay token amount</p>
                        <button onClick={() => handleSimulatePayment(lead)} className="text-[9px] text-blue-600 font-bold underline text-center">Simulate Token Payment</button>
                      </>
                    )
                  ) : (
                    <>
                      <button onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/move-to-order\`, { method: "PUT", headers: { Authorization: \`Bearer \${token}\` } });
                          if (res.ok) { alert("Moved to Order Journey!"); fetchLeads(); }
                        } catch (e) {}
                      }} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-bold rounded-lg transition flex justify-center items-center gap-2">
                         Move to Order Journey
                      </button>
                    </>
                  )}`;

if (code.includes(oldTokenBlock)) {
  code = code.replace(oldTokenBlock, newTokenBlock);
  console.log("Patched Token block");
} else {
  console.log("Could not find token block");
}

fs.writeFileSync(file, code);
