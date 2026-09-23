const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const auTemplateRegex = /const auTemplate = \[[\\s\\S]*?\];/;
const newAuTemplate = `const auTemplate = [
        { field: "consumerName", regex: AU_DICT.namePatterns.join('|'), type: "string", required: false },
        { field: "consumerNumber", regex: AU_DICT.accountNumber, type: "string", required: false },
        { field: "consumerBillNumber", regex: AU_DICT.billNumber, type: "string", required: false },
        { field: "meterCategory", regex: "(Smart\\\\s*Meter|Interval|Basic\\\\s*Meter|Accumulation\\\\s*Meter)", type: "string", required: false },
        { field: "tariffCategory", regex: AU_DICT.tariffCategory, type: "string", required: false },
        { field: "discom", regex: AU_RETAILERS.map(r => r.pattern.source).join('|'), type: "string", required: false },
        { field: "monthlyBill", regex: AU_DICT.amountPatterns.join('|'), type: "number", required: true },
        { field: "billIssuedDate", regex: AU_DICT.billIssueDate, type: "string", required: false },
        { field: "quarterlyKwh", regex: AU_DICT.usagePatterns.join('|'), type: "number", required: false },
        { field: "state", regex: "(?:VIC|NSW|QLD|WA|SA|TAS|ACT|NT|Victoria|New\\\\s*South\\\\s*Wales|Queensland|Western\\\\s*Australia|South\\\\s*Australia|Tasmania)", type: "string", required: false },
        { field: "dueDate", regex: AU_DICT.dueDate, type: "string", required: false }
      ];`;

btc = btc.replace(auTemplateRegex, newAuTemplate);
fs.writeFileSync(btcPath, btc);
console.log('billTemplateController updated');
