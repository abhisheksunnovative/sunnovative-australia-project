const fs = require('fs');
const path = 'Website_Admin/src/components/OrderJourneyScreen.jsx';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(
    'onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}',
    'onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}'
);

text = text.replace(
    'value={settings.installDateSelectionSlaDays || 3}',
    'value={settings.installDateSelectionSlaDays !== undefined ? settings.installDateSelectionSlaDays : 3}'
);

text = text.replace(
    'onChange={(e) => setSettings({...settings, installDateSelectionSlaDays: parseInt(e.target.value) || 3})}',
    'onChange={(e) => setSettings({...settings, installDateSelectionSlaDays: e.target.value === "" ? "" : parseInt(e.target.value)})}'
);

fs.writeFileSync(path, text);
console.log("Done");
