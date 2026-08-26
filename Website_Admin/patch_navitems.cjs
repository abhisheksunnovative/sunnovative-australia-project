const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldNav = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-leads", name: isFreelancer ? "Self Leads" : "My Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads },
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
  ];`;

const newNav = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-leads", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 },
    { id: "bde-self-leads", name: "Self Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads || 0 },
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
  ];`;

code = code.replace(oldNav, newNav);

const stateCountsOld = `  const [tabCounts, setTabCounts] = useState({
    leads: 0,
    prospects: 0,
    projects: 0
  });`;

const stateCountsNew = `  const [tabCounts, setTabCounts] = useState({
    leads: 0,
    eligibility: 0,
    prospects: 0,
    projects: 0
  });`;

code = code.replace(stateCountsOld, stateCountsNew);
          
const setCountsOld = `      setTabCounts({
        leads: leadsCount,
        prospects: prospectsCount,
        projects: orderJourneyCount
      });`;
      
const setCountsNew = `      setTabCounts({
        leads: leadsCount,
        eligibility: eligibilityCount,
        prospects: prospectsCount,
        projects: orderJourneyCount
      });`;

code = code.replace(setCountsOld, setCountsNew);

fs.writeFileSync(file, code);
