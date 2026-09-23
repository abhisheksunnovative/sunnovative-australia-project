const fs = require('fs');

const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldSave = `  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {`;

const newSave = `  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation: Check if any rule has an empty field name
    const unmappedRules = formData.extractionRules.filter(r => !r.field);
    if (unmappedRules.length > 0) {
        alert("Validation Error: Please assign a 'Field Name' from the dropdown to every regex rule before saving.");
        return;
    }
    
    try {
      const payload = {`;

if (code.includes(oldSave)) {
  code = code.replace(oldSave, newSave);
  fs.writeFileSync(path, code);
  console.log('Added validation to handleSave');
} else if (code.includes(oldSave.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldSave.replace(/\n/g, '\r\n'), newSave.replace(/\n/g, '\r\n'));
  fs.writeFileSync(path, code);
  console.log('Added validation to handleSave (CRLF)');
} else {
  console.log('Could not find handleSave');
}
