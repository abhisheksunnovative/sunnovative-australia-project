const fs = require('fs');

let c = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

const oldHistoryAction = `history: [{ action: 'Bulk uploaded' }],`;
const newHistoryAction = `history: [{ action: 'Manually created by BDE (Bulk Upload)' }],`;

const oldNameMap = `const name = String(row.name || '').trim();`;
const newNameMap = `const name = String(row.name || row.full_name || row.Name || '').trim();`;

const oldPincodeMap = `pincode: row.pincode ? String(row.pincode) : undefined,`;
const newPincodeMap = `pincode: (row.pincode || row.postcode) ? String(row.pincode || row.postcode) : undefined,`;

const oldKwMap = `kw: row.systemCapacity ? String(row.systemCapacity) : '0',`;
const newKwMap = `kw: (row.systemCapacity || row.KW || row.kw) ? String(row.systemCapacity || row.KW || row.kw) : '0',`;

const oldDistrictMap = `district: row.district || undefined,`;
const newDistrictMap = `district: row.district || row.city || row.City || undefined,`;

if (c.includes(oldHistoryAction)) {
  c = c.replace(oldHistoryAction, newHistoryAction);
  c = c.replace(oldNameMap, newNameMap);
  c = c.replace(oldPincodeMap, newPincodeMap);
  c = c.replace(oldKwMap, newKwMap);
  c = c.replace(oldDistrictMap, newDistrictMap);
  fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', c);
  console.log("Patched leadController mappings!");
} else {
  console.log("Could not find the target string.");
}
