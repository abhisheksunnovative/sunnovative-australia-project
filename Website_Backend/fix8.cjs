const fs = require('fs');

// Patch Ocrextractor.js
const ocrPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(ocrPath, 'utf8');

const amtBlockRegex = /const amountPatterns = \[[\\s\\S]*?\];/;
ocr = ocr.replace(amtBlockRegex, 'const amountPatterns = AU_DICT.amountPatterns.map(p => new RegExp(p, "i"));');

const usageBlockRegex = /const usagePatterns = \[[\\s\\S]*?\];/;
ocr = ocr.replace(usageBlockRegex, 'const usagePatterns = AU_DICT.usagePatterns.map(p => new RegExp(p, "i"));');

const nameBlockRegex = /const namePatterns = \[[\\s\\S]*?\];/;
ocr = ocr.replace(nameBlockRegex, 'const namePatterns = AU_DICT.namePatterns.map(p => new RegExp(p, "i"));');

fs.writeFileSync(ocrPath, ocr);
console.log('Ocrextractor patched.');

// Patch billTemplateController.js
const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const btcBlockRegex = /const auTemplate = \[[\\s\\S]*?\];/;
const newBtcBlock = `const auTemplate = [
        { field: "monthlyBill", regex: AU_DICT.amountPatterns.join('|'), type: "number", required: true },
        { field: "consumerNumber", regex: AU_DICT.accountNumber, type: "string", required: true },
        { field: "tariffCategory", regex: AU_DICT.tariffCategory, type: "string", required: false },
        { field: "quarterlyKwh", regex: AU_DICT.usagePatterns.join('|'), type: "number", required: false },
        { field: "dueDate", regex: AU_DICT.dueDate, type: "string", required: false }
      ];`;
btc = btc.replace(btcBlockRegex, newBtcBlock);

fs.writeFileSync(btcPath, btc);
console.log('billTemplateController patched.');
