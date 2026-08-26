const fs = require('fs');

function applyTo(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Convert Leads Filter to expose base prospects for counting
  // This varies by file, let's just create a generic count function right before the return statement.
  if (!code.includes('const getCountForProjectType')) {
    code = code.replace(/return \(/, `
  const getCountForProjectType = (ptValue) => {
    const arr = typeof filteredLeads !== 'undefined' ? filteredLeads : (typeof displayedProjects !== 'undefined' ? displayedProjects : []);
    // wait, if we use filteredLeads, it will filter by itself. We need base leads!
    // Since BDEProspects and BDEProjectTracking use different variable names (leads vs projects),
    // let's do a loose filter just on the state array (leads or projects).
    const srcArray = (typeof leads !== 'undefined' ? leads : (typeof projects !== 'undefined' ? projects : []));
    
    // Quick filter just for project type
    let matches = srcArray;
    
    // In Prospects, we only count leads that are prospects.
    if (file.includes('Prospects')) {
       matches = matches.filter(l => {
          const isAU = l.country === 'australia' || l.country === 'AU';
          const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
          return l.installDateBooked && !isEligibleForOrderJourney;
       });
    }

    if (ptValue === "All") return matches.length;
    return matches.filter(l => (l.solarType || l.projectType || "").toLowerCase() === ptValue.toLowerCase()).length;
  };

  return (`);
  }

  // 2. Replace the Select dropdown with Cards
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
    console.log("Patched " + file);
  } else {
      console.log("No select found in " + file);
  }
  
  fs.writeFileSync(file, code);
}

applyTo('src/components/bde/BDEProspects.jsx');
applyTo('src/components/bde/BDEProjectTracking.jsx');
