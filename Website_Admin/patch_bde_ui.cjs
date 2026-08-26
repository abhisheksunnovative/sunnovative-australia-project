const fs = require('fs');

let file = fs.readFileSync('../Website_Admin/src/components/bde/BDELeadManagement.jsx', 'utf8');

// 1. Calculate projectTypeCounts
const ptCountsBlock = `
  const projectTypeCounts = (activeTab === "manual" ? manualLeads : websiteLeads).reduce((acc, lead) => {
    if (filterTab === "eligibility" && lead.isEligibleForInstallation) return acc;
    if (filterTab === "self-leads" && !lead.isEligibleForInstallation) return acc;
    const pt = (lead.solarType || lead.projectType || "Residential").toLowerCase();
    acc[pt] = (acc[pt] || 0) + 1;
    return acc;
  }, {});
`;
if (!file.includes('projectTypeCounts')) {
  file = file.replace(
    'const displayedLeads = ',
    ptCountsBlock + '\n  const displayedLeads = '
  );
}

// 2. Add Project Type Cards UI
const ptCardsUI = `
      {/* Project Type Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div 
          onClick={() => setProjectTypeFilter("All")}
          className={\`cursor-pointer border p-3 rounded-xl shadow-sm transition-all text-center flex flex-col items-center justify-center \${projectTypeFilter === "All" ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}\`}
        >
          <span className="text-xs font-black uppercase tracking-wider mb-1">All Types</span>
          <span className={\`text-lg font-black \${projectTypeFilter === "All" ? 'text-blue-600' : 'text-slate-800'}\`}>
            {(activeTab === "manual" ? manualLeads : websiteLeads).filter(l => !(filterTab === "eligibility" && l.isEligibleForInstallation) && !(filterTab === "self-leads" && !l.isEligibleForInstallation)).length}
          </span>
        </div>
        {dynamicProjectTypes.map(pt => {
          const count = projectTypeCounts[pt.value.toLowerCase()] || 0;
          const isActive = projectTypeFilter.toLowerCase() === pt.value.toLowerCase();
          return (
            <div 
              key={pt.value}
              onClick={() => setProjectTypeFilter(pt.value)}
              className={\`cursor-pointer border p-3 rounded-xl shadow-sm transition-all text-center flex flex-col items-center justify-center \${isActive ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}\`}
            >
              <span className="text-xs font-black uppercase tracking-wider mb-1 truncate w-full px-1">{pt.label}</span>
              <span className={\`text-lg font-black \${isActive ? 'text-blue-600' : 'text-slate-800'}\`}>{count}</span>
            </div>
          )
        })}
      </div>
`;

if (!file.includes('{/* Project Type Filter Cards */}')) {
  file = file.replace(
    '<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">',
    ptCardsUI + '\n      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 mt-6">'
  );
}

// 3. Remove Dropdown
const dropdownToRemove = `<div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Project Type</label>
            <select 
              value={projectTypeFilter} 
              onChange={(e) => setProjectTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Types</option>
              {dynamicProjectTypes.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>`;
if (file.includes(dropdownToRemove)) {
  file = file.replace(dropdownToRemove, '');
}

// 4. Update the Card UI to remove NMI and change buttons based on filterTab
file = file.replace(
  `<div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                    <span>NMI / Acc #:</span>
                    <span className="text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{lead.nmi || 'Pending'}</span>
                  </div>
                  {lead.retailer ? (
                    <div className="text-[11px] font-bold text-blue-700">Retailer/DNSP: {lead.retailer}</div>
                  ) : (
                    <div className="text-[11px] font-bold text-slate-400">Retailer/DNSP: Not detected</div>
                  )}
                </div>`,
  ''
);

// We need to replace the isFreelancer button logic 
// from:
/*
                {isFreelancer ? (
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
*/
// to handle filterTab.

let replacementBtnLogic = `
                {filterTab === "eligibility" ? (
                  !lead.billAmount ? (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => handleOpenUploadBill(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Zap className="w-4 h-4" /> Upload Bill
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-auto">
                      <button onClick={() => markEligible(lead._id)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <CheckCircle className="w-4 h-4" /> Eligible for Installation
                      </button>
                    </div>
                  )
                ) : filterTab === "self-leads" ? (
                  <div className="w-full flex flex-col gap-2 mt-auto">
                    { (lead.hasLoggedIn || lead.preferredInstallDate) ? (
                      <button onClick={() => handleQualify(lead)} className="w-full justify-center flex items-center gap-2 text-white text-sm font-bold px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                        <Calendar className="w-4 h-4" /> Finalize Date
                      </button>
                    ) : (
                      <>
                        <button onClick={() => window.open(\`http://localhost:3001/customer/login\`, '_blank')} className="w-full justify-center flex items-center gap-2 text-white text-xs font-bold px-3 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md transition-all">
                          Ask customer to login & apply
                        </button>
                        <a href={\`http://localhost:3001/customer/login\`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline text-center w-full block">
                          Fill form on behalf of customer &rarr;
                        </a>
                      </>
                    )}
                  </div>
                ) : (
`;

// I will use regex to replace it
const regexBtn = /{isFreelancer \? \([\s\S]*?\) : \(/;
if (regexBtn.test(file)) {
  file = file.replace(regexBtn, replacementBtnLogic);
}

fs.writeFileSync('../Website_Admin/src/components/bde/BDELeadManagement.jsx', file);
console.log("Patched Lead UI");
