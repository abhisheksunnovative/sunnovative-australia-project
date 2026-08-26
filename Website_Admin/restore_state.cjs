const fs = require('fs');

// --- 1. Fix BDELayout.jsx ---
const fileLayout = 'src/components/bde/BDELayout.jsx';
let layoutCode = fs.readFileSync(fileLayout, 'utf8');

const layoutLogic = `      let eligibilityCount = 0;
      let leadsCount = 0;
      let prospectsCount = 0;
      let orderJourneyCount = 0;
      
      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        const leads = d.leads || [];
        
        leads.forEach(l => {
          if (l.status === 'Lost' || l.status === 'Not Interested' || l.status === 'Converted') return;
          
          const isAU = l.country === 'australia' || l.country === 'AU';
          const isEligibleForOrderJourney = isAU ? l.bdeMovedToOrderJourney : (l.tokenPaid && l.assignedEPCId);
          
          if (isEligibleForOrderJourney) return; // Moves out of prospects

          if (l.installDateBooked) {
             prospectsCount++;
          } else if (!l.convertedProjectId) {
             if (l.isEligibleForInstallation) leadsCount++;
             else eligibilityCount++;
          }
        });
      }
      if (projRes && projRes.ok) {`;

layoutCode = layoutCode.replace(/let eligibilityCount = 0;[\s\S]*?if\s*\(projRes\s*&&\s*projRes\.ok\)\s*\{/, layoutLogic);
fs.writeFileSync(fileLayout, layoutCode);

// --- 2. Fix BDELeadManagement.jsx Tabs ---
const fileLead = 'src/components/bde/BDELeadManagement.jsx';
let leadCode = fs.readFileSync(fileLead, 'utf8');

// Ensure we have activeTab and manualLeads/websiteLeads
if (!leadCode.includes('const [activeTab, setActiveTab]')) {
  leadCode = leadCode.replace(/const baseLeads = leads\.filter/, `const [activeTab, setActiveTab] = useState("manual");\n\n  const baseLeads = leads.filter`);
}
if (!leadCode.includes('const manualLeads = baseLeads.filter')) {
  leadCode = leadCode.replace(/const displayedLeads = baseLeads\.filter/, `const manualLeads = baseLeads.filter(l => l.history?.some(h => h.action.includes("Manually created by BDE")));
  const websiteLeads = baseLeads.filter(l => !l.history?.some(h => h.action.includes("Manually created by BDE")));
  const displayedLeads = (activeTab === "manual" ? manualLeads : websiteLeads).filter`);
}

// Make sure tabs are rendered for everyone (no isFreelancer block around tabs)
const tabsUI = `<div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab("website")}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all \${activeTab === 'website' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            Assigned Leads ({websiteLeads.length})
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all \${activeTab === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
          >
            Self-Sourced Leads ({manualLeads.length})
          </button>
        </div>`;

if (!leadCode.includes('Assigned Leads ({websiteLeads.length})')) {
   leadCode = leadCode.replace(/<div className="flex items-center gap-2">[\s\S]*?<\/div>/, tabsUI);
}

fs.writeFileSync(fileLead, leadCode);
console.log('Restored layout and lead management exactly to the state requested!');
