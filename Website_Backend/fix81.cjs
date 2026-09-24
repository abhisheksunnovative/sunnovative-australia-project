const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = '<option value="monthlyBill">monthlyBill (Amount)</option>';
const replacementStr = '<option value="monthlyBill">monthlyBill (Amount)</option>\n                              <option value="dueAmount">dueAmount (Overdue Balance)</option>';

if (code.includes(targetStr) && !code.includes('dueAmount (Overdue Balance)')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(path, code);
  console.log("Added dueAmount to dropdown!");
} else {
  console.log("Already added or target string not found.");
}
