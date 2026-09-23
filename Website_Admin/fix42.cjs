const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/DiscomManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldEdit = `  const handleEdit = (discom) => {
    setEditingId(discom._id);
    setFormData({
      name: discom.name,
      districts: discom.districts.join(", ")
    });
  };`;

const newEdit = `  const handleEdit = (discom) => {
    setEditingId(discom._id);
    setFormData({
      name: discom.name || "",
      districts: Array.isArray(discom.districts) ? discom.districts.join(", ") : ""
    });
  };`;

if (code.includes(oldEdit)) {
  code = code.replace(oldEdit, newEdit);
  console.log('Patched handleEdit');
} else if (code.includes(oldEdit.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldEdit.replace(/\n/g, '\r\n'), newEdit.replace(/\n/g, '\r\n'));
  console.log('Patched handleEdit (CRLF)');
}

const oldInput = `<input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. MSEB" className="w-full border p-2 rounded-xl text-sm" />`;
const newInput = `<input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. MSEB" className="w-full border p-2 rounded-xl text-sm" />`;
if (code.includes(oldInput)) {
  code = code.replace(oldInput, newInput);
  console.log('Patched name input');
}

const oldInput2 = `<input type="text" value={formData.districts} onChange={(e) => setFormData({...formData, districts: e.target.value})} placeholder="e.g. Pune, Mumbai, Thane" className="w-full border p-2 rounded-xl text-sm" />`;
const newInput2 = `<input type="text" value={formData.districts || ""} onChange={(e) => setFormData({...formData, districts: e.target.value})} placeholder="e.g. Pune, Mumbai, Thane" className="w-full border p-2 rounded-xl text-sm" />`;
if (code.includes(oldInput2)) {
  code = code.replace(oldInput2, newInput2);
  console.log('Patched districts input');
}

const oldSave = `districts: formData.districts.split(",").map(d => d.trim()).filter(Boolean)`;
const newSave = `districts: (formData.districts || "").split(",").map(d => d.trim()).filter(Boolean)`;
if (code.includes(oldSave)) {
  code = code.replace(oldSave, newSave);
  console.log('Patched handleSave');
}

fs.writeFileSync(path, code);
