const fs = require('fs');
const file = 'src/components/bde/BDEProspects.jsx';
let code = fs.readFileSync(file, 'utf8');

const filterBlockOld = `  const filteredLeads = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    const isProspect = l.installDateBooked && !isEligibleForOrderJourney;
    if (!isProspect) return false;

    // Apply filters
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (kwFilter !== "All" && l.kw !== kwFilter) return false;`;

const filterBlockNew = `  const baseProspects = leads.filter(l => {
    const isAU = l.country === 'australia' || l.country === 'AU';
    const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
    return l.installDateBooked && !isEligibleForOrderJourney;
  });

  const getCountForProjectType = (ptValue) => {
    if (ptValue === "All") return baseProspects.length;
    return baseProspects.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  const filteredLeads = baseProspects.filter(l => {
    // Apply filters
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (kwFilter !== "All" && l.kw !== kwFilter) return false;`;

if (code.includes('const filteredLeads = leads.filter(l => {')) {
  code = code.replace(filterBlockOld, filterBlockNew);
  console.log("Replaced filter block in Prospects");
}

const selectRegex = /<select value=\{projectTypeFilter\} onChange=\{e => setProjectTypeFilter\(e\.target\.value\)\}[\s\S]*?<\/select>/;
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
  console.log("Patched cards in Prospects");
}

// But I also need to make sure the token block in Prospects is patched, because I reverted BDEProspects.jsx and lost the token payment patch (`patch_prospects.cjs`).
// Let's just run node patch_prospects.cjs afterwards!

fs.writeFileSync(file, code);
