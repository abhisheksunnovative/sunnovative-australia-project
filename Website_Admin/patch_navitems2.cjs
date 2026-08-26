const fs = require('fs');
const file = 'src/components/bde/BDELayout.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldNav = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-leads", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 },
    { id: "bde-self-leads", name: "Self Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads || 0 },
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
  ];`;

const newNav = `  const navItems = [
    { id: "bde-aust", name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-emerald-400" /> },
    { id: "bde-customer-eligibility", name: "Customer Eligibility List", icon: <Users className="w-5 h-5" />, count: tabCounts.eligibility || 0 },
    { id: "bde-leads", name: "Self Leads", icon: <Users className="w-5 h-5" />, count: tabCounts.leads || 0 },
    { id: "bde-prospects", name: "My Prospects", icon: <CheckSquare className="w-5 h-5" />, count: tabCounts.prospects },
    { id: "bde-projects", name: "Customer Order Journey", icon: <ClipboardList className="w-5 h-5" />, count: tabCounts.projects },
    ...(!isFreelancer ? [{ id: "bde-demand", name: "Demand Pool", icon: <Map className="w-5 h-5" /> }] : []),
  ];`;

code = code.replace(oldNav, newNav);
fs.writeFileSync(file, code);
