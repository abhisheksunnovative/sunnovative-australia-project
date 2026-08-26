const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// Ensure signature has filterTab
code = code.replace(
  /export default function BDELeadManagement\(\{ bdeId, country, bdeType \}\) \{/,
  'export default function BDELeadManagement({ bdeId, country, bdeType, filterTab = "self-leads" }) {'
);

const oldLeadsBlock = `  const displayedLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter(l => { 
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (!searchQuery) return true; 
    const sq = searchQuery.toLowerCase(); 
    return (l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq); 
  });`;

const newLeadsBlock = `  const filteredByTabLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter(l => {
    if (filterTab === "eligibility") {
      if (l.isEligibleForInstallation === true) return false;
    } else if (filterTab === "self-leads") {
      if (isFreelancer && l.isEligibleForInstallation !== true) return false;
    }
    return true;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return filteredByTabLeads.length;
    return filteredByTabLeads.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const displayedLeads = filteredByTabLeads.filter(l => { 
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (!searchQuery) return true; 
    const sq = searchQuery.toLowerCase(); 
    return (l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq); 
  });`;

// Replace using literal text replace for exact match!
if (code.includes(oldLeadsBlock)) {
  code = code.replace(oldLeadsBlock, newLeadsBlock);
  console.log("Replaced displayedLeads correctly!");
} else {
  // If exact match fails due to minor formatting, let's use regex
  code = code.replace(/const displayedLeads = \(activeTab === "manual" \? manualLeads : websiteLeads\)\.filter\(l => \{[\s\S]*?\}\);/m, newLeadsBlock);
  console.log("Replaced using regex");
}

const oldCards = `{dynamicProjectTypes.map(pt => (
          <button 
            key={pt.value}
            onClick={() => setProjectTypeFilter(pt.value)}
            className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all \${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
          >
            {pt.label}
          </button>
        ))}`;

const newCards = `{dynamicProjectTypes.map(pt => {
          const ptCount = getCountForProjectType(pt.value);
          if (ptCount === 0 && projectTypeFilter !== pt.value) return null;
          return (
          <button 
            key={pt.value}
            onClick={() => setProjectTypeFilter(pt.value)}
            className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 \${projectTypeFilter === pt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
          >
            {pt.label}
            <span className={\`px-2 py-0.5 rounded-md text-[10px] font-black \${projectTypeFilter === pt.value ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}\`}>{ptCount}</span>
          </button>
        )})}`;

if (code.includes(oldCards)) {
  code = code.replace(oldCards, newCards);
} else {
  // Regex fallback
  code = code.replace(/\{dynamicProjectTypes\.map\(pt => \([\s\S]*?<\/button>\s*\)\)\}/m, newCards);
}

// And replace All Types button
code = code.replace(
  /<button \s*onClick=\{\(\) => setProjectTypeFilter\("All"\)\}\s*className=\{.*?\}\s*>\s*All Types\s*<\/button>/m,
  `<button 
          onClick={() => setProjectTypeFilter("All")}
          className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 \${projectTypeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}\`}
        >
          All Types
          <span className={\`px-2 py-0.5 rounded-md text-[10px] font-black \${projectTypeFilter === 'All' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}\`}>{getCountForProjectType("All")}</span>
        </button>`
);

// We must also re-apply the Col 4 fix that was lost during git checkout!
const oldCol4 = `{isFreelancer ? (
                  !lead.billAmount ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                          Ask customer to login and provide an installation date to unlock Finalize Date.
                        </div>
                      )}
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>
                )}`;

const newCol4 = `{isFreelancer && filterTab === 'eligibility' ? (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg font-bold text-center w-full shadow-sm">
                      Note: Firstly upload the bill of customer to get recommended system of KW.
                    </p>
                    {!lead.billAmount ? (
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    ) : (
                      <button onClick={async () => {
                          try {
                            const res = await fetch(\`\${API_BASE}/api/bde/leads/\${lead._id}/mark-eligible\`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" }
                            });
                            if (res.ok) { window.location.reload(); }
                          } catch (e) {}
                        }} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <CheckCircle className="w-4 h-4" /> Mark as Eligible
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                        <button onClick={() => {
                          if (!lead.nextFollowUp) {
                            alert("Firstly select the follow up date");
                            return;
                          }
                          handleQualify(lead);
                        }} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                          <Calendar className="w-4 h-4" /> Finalize Date
                        </button>
                      ) : (
                        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold text-center w-full shadow-sm flex flex-col gap-1.5">
                          <span>Ask customer to login and provide an installation date to unlock Finalize Date.</span>
                          <a href="/au/#account" target="_blank" className="text-rose-700 underline flex items-center justify-center gap-1"><ArrowRight className="w-3 h-3"/> Open Customer Portal</a>
                        </div>
                      )}
                    <button onClick={() => handleReject(lead)} className="w-full justify-center px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5"/> Reject Lead
                    </button>
                  </div>
                )}`;

if (code.includes(oldCol4)) {
  code = code.replace(oldCol4, newCol4);
  console.log("Replaced Col 4");
}

fs.writeFileSync(file, code);
console.log("All patches applied correctly!");
