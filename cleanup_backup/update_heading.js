const fs = require('fs');
let text = fs.readFileSync('Website_Admin/src/components/UnifiedAddLeadModal.jsx', 'utf-8');
text = text.replace('<h2 className="text-lg font-bold text-gray-800">Add New Lead</h2>', '<h2 className="text-lg font-bold text-gray-800">{existingLead ? "Upload Your Light Bill" : "Add New Lead"}</h2>');
fs.writeFileSync('Website_Admin/src/components/UnifiedAddLeadModal.jsx', text);
