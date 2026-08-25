const XLSX = require('xlsx');

const csvData = `full_name,email,phone,state,district,postcode,stc_zone
James Wilson,james.wilson@outlook.com.au,+61-412345678,NSW,Sydney,2095,Zone 3`;

const workbook = XLSX.read(csvData, { type: 'string' });
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const leads = [];
const errors = [];
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const mobile = String(row.phone || row.mobile || '').trim();
  const name = String(row.name || row.full_name || row.Name || '').trim();
  console.log("Parsed row:", { mobile, name, raw: row });
  if (!mobile) { errors.push(`Row ${i + 2}: phone/mobile missing`); continue; }
  leads.push({ name, mobile });
}
console.log("Leads:", leads);
console.log("Errors:", errors);
