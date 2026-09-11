const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', 'utf-8');

text = text.replace('const handleOpenAdd = () => {', 'const handleOpenAdd = () => {\n    setCurrentLead(null);');

text = text.replace('onClose={() => setIsAddModalOpen(false)}', 'onClose={() => { setIsAddModalOpen(false); setCurrentLead(null); }}');
text = text.replace('onSuccess={() => { setIsAddModalOpen(false); fetchLeads(); }}', 'onSuccess={() => { setIsAddModalOpen(false); setCurrentLead(null); fetchLeads(); }}');

fs.writeFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', text);
