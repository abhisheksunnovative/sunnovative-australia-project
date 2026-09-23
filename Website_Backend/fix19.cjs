const fs = require('fs');
const p = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(p, 'utf8');

const oldText = `<option value="monthlyBill">monthlyBill (Amount)</option>
                            <option value="quarterlyKwh">quarterlyKwh / monthlyUnits</option>
                            <option value="consumerNumber">consumerNumber</option>
                            <option value="fullName">fullName</option>
                            <option value="tariffCategory">tariffCategory</option>
                            <option value="dueDate">dueDate</option>
                            <option value="meterTypeInfo">meterTypeInfo</option>
                            <option value="state">state</option>`;

const newText = `<option value="monthlyBill">monthlyBill (Amount)</option>
                            <option value="quarterlyKwh">quarterlyKwh / monthlyUnits</option>
                            <option value="consumerNumber">consumerNumber</option>
                            <option value="consumerBillNumber">consumerBillNumber / invoiceNumber</option>
                            <option value="fullName">fullName / consumerName</option>
                            <option value="tariffCategory">tariffCategory</option>
                            <option value="meterCategory">meterCategory</option>
                            <option value="dueDate">dueDate</option>
                            <option value="billIssuedDate">billIssuedDate</option>
                            <option value="state">state</option>`;

if (code.includes(oldText)) {
  code = code.replace(oldText, newText);
  fs.writeFileSync(p, code);
  console.log('Fixed LF');
} else if (code.includes(oldText.replace(/\n/g, '\r\n'))) {
  code = code.replace(oldText.replace(/\n/g, '\r\n'), newText.replace(/\n/g, '\r\n'));
  fs.writeFileSync(p, code);
  console.log('Fixed CRLF');
} else {
  console.log('Not found');
}
