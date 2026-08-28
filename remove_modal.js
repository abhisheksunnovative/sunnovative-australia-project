const fs = require('fs');

let text = fs.readFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', 'utf-8');

text = text.replace(/const handleOpenUploadBill = \(lead\) => \{[^}]+\};/, 
    'const handleOpenUploadBill = (lead) => {\n    setCurrentLead(lead);\n    setIsAddModalOpen(true);\n  };');

const modalStr = `{isAddModalOpen && (
          <UnifiedAddLeadModal 
            isBDE={true} 
            bdeId={bdeId}
            userCountry={country}
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={() => { setIsAddModalOpen(false); fetchLeads(); }} 
          />
        )}`;

const newModalStr = `{isAddModalOpen && (
          <UnifiedAddLeadModal 
            isBDE={true} 
            bdeId={bdeId}
            userCountry={country}
            existingLead={currentLead}
            onClose={() => { setIsAddModalOpen(false); setCurrentLead(null); }} 
            onSuccess={() => { setIsAddModalOpen(false); setCurrentLead(null); fetchLeads(); }} 
          />
        )}`;

text = text.replace(modalStr, newModalStr);

// Delete the billUploadLead JSX block
text = text.replace(/\{\/\* Upload Bill Modal for Freelancers \*\/\}[\s\S]*?\{\s*billUploadLead\s*&&\s*\([\s\S]*?<div className="fixed inset-0[^>]*>[\s\S]*?<\/div>\s*\)\s*\}/, '');
// Wait, regex might fail to match perfectly nested divs.
// I'll just remove the whole block roughly or precisely.

fs.writeFileSync('Website_Admin/src/components/bde/BDELeadManagement.jsx', text);
