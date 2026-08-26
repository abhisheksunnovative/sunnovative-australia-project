const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const navRegex = /const navItems = \[[\s\S]*?\];/;

const newNav = `const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-customer-eligibility", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 },
    { id: "bde-leads", name: "Self Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads || 0 },
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
    { id: "bde-profile", name: "My Profile", icon: <User className="w-5 h-5" /> }
  ];`;

code = code.replace(navRegex, newNav);

const stateCountsRegex = /const \[tabCounts, setTabCounts\] = useState\(\{[\s\S]*?\}\);/;
const stateCountsNew = `const [tabCounts, setTabCounts] = useState({
    leads: 0,
    eligibility: 0,
    prospects: 0,
    projects: 0
  });`;

code = code.replace(stateCountsRegex, stateCountsNew);

const setCountsRegex = /setTabCounts\(\{\s*leads: leadsCount,\s*prospects: prospectsCount,\s*projects: orderJourneyCount\s*\}\);/;
const setCountsNew = `setTabCounts({
        leads: leadsCount,
        eligibility: eligibilityCount,
        prospects: prospectsCount,
        projects: orderJourneyCount
      });`;

code = code.replace(setCountsRegex, setCountsNew);

fs.writeFileSync(file, code);
console.log('Fixed BDELayout!');
