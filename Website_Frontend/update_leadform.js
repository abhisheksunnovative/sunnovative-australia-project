
const fs = require('fs');
let code = fs.readFileSync('src/components/LeadForm.jsx', 'utf-8');

code = code.replace(
    'ownsProperty: [ownsProperty ? "Yes" : "No", (v) => setOwnsProperty(v === "Yes")],',
    'tariffDesc: [tariffDesc, setTariffDesc],\n        meterCategory: [meterCategory, setMeterCategory],\n        discom: [discom, setDiscom],\n        ownsProperty: [ownsProperty ? "Yes" : "No", (v) => setOwnsProperty(v === "Yes")],'
);

code = code.replace(
    '{formSettings.fields.filter(f => f.key !== "billFile").map((field, idx) => renderDynamicField(field, idx))}',
    \{(() => {
        const dynamicFields = [...formSettings.fields.filter(f => f.key !== 'billFile')];
        if (!dynamicFields.find(f => f.key === 'tariffDesc')) dynamicFields.push({ label: 'Tariff', key: 'tariffDesc', type: 'text', required: false, options: [] });
        if (!dynamicFields.find(f => f.key === 'meterCategory')) dynamicFields.push({ label: 'Meter Category', key: 'meterCategory', type: 'text', required: false, options: [] });
        if (!dynamicFields.find(f => f.key === 'discom')) dynamicFields.push({ label: 'Discom / Retailer', key: 'discom', type: 'text', required: false, options: [] });
        return dynamicFields.map((field, idx) => renderDynamicField(field, idx));
    })()}\
);

fs.writeFileSync('src/components/LeadForm.jsx', code);
