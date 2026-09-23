const fs = require('fs');

const btmPath = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let btm = fs.readFileSync(btmPath, 'utf8');

const selectBlockRegex = /<select[\s\S]*?<option value="monthlyBill">[\s\S]*?<\/select>/;

const newSelectBlock = `<select value={rule.field} onChange={e => updateRule(idx, 'field', e.target.value)} className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="">Select Field...</option>
                            <option value="monthlyBill">monthlyBill (Amount)</option>
                            <option value="quarterlyKwh">quarterlyKwh / monthlyUnits</option>
                            <option value="consumerNumber">consumerNumber</option>
                            <option value="consumerBillNumber">consumerBillNumber / invoiceNumber</option>
                            <option value="fullName">fullName / consumerName</option>
                            <option value="tariffCategory">tariffCategory</option>
                            <option value="meterCategory">meterCategory</option>
                            <option value="dueDate">dueDate</option>
                            <option value="billIssuedDate">billIssuedDate</option>
                            <option value="state">state</option>
                            <option value="discom">discom / retailer</option>
                          </select>`;

btm = btm.replace(selectBlockRegex, newSelectBlock);
fs.writeFileSync(btmPath, btm);
console.log('BillTemplateManagementScreen.jsx updated');
