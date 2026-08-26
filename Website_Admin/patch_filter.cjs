const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix signature
code = code.replace(
  /export default function BDELeadManagement\(\{ bdeId, country, bdeType \}\) \{/,
  'export default function BDELeadManagement({ bdeId, country, bdeType, filterTab = "self-leads" }) {'
);

// 2. Fix displayedLeads and compute counts
const oldLeadsBlock = `  const displayedLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter(l => { 
    if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
    if (projectTypeFilter !== "All" && (l.solarType || l.projectType || "").toLowerCase() !== projectTypeFilter.toLowerCase()) return false;
    if (!searchQuery) return true; 
    const sq = searchQuery.toLowerCase(); 
    return (l.name || "").toLowerCase().includes(sq) || (l.email || "").toLowerCase().includes(sq) || (l.mobile || "").toLowerCase().includes(sq); 
  });
  console.log("Displayed leads count:", displayedLeads.length, { filterStatus, projectTypeFilter, activeTab, isFreelancer });
  displayedLeads.sort((a, b) => { if (sortOrder === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt); if (sortOrder === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt); if (sortOrder === "name-asc") return (a.name || "").localeCompare(b.name || ""); if (sortOrder === "name-desc") return (b.name || "").localeCompare(a.name || ""); return 0; });`;

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
  });
  
  console.log("Displayed leads count:", displayedLeads.length, { filterStatus, projectTypeFilter, activeTab, isFreelancer });
  displayedLeads.sort((a, b) => { if (sortOrder === "date-desc") return new Date(b.createdAt) - new Date(a.createdAt); if (sortOrder === "date-asc") return new Date(a.createdAt) - new Date(b.createdAt); if (sortOrder === "name-asc") return (a.name || "").localeCompare(b.name || ""); if (sortOrder === "name-desc") return (b.name || "").localeCompare(a.name || ""); return 0; });`;

if (code.includes('const displayedLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter(l => {')) {
  code = code.replace(oldLeadsBlock, newLeadsBlock);
}

// 3. Update project type cards to include counts
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
          if (ptCount === 0 && projectTypeFilter !== pt.value) return null; // hide empty categories
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

if (code.includes('key={pt.value}')) {
  code = code.replace(oldCards, newCards);
  // and update "All Types" button too
  code = code.replace(
    /All Types\s*<\/button>/,
    `All Types
          <span className={\`px-2 py-0.5 rounded-md text-[10px] font-black \${projectTypeFilter === 'All' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}\`}>{getCountForProjectType("All")}</span>
        </button>`
  );
}

fs.writeFileSync(file, code);
console.log("Patched BDELeadManagement correctly this time!");
