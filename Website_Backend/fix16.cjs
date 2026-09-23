const fs = require('fs');

const dictPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let dict = fs.readFileSync(dictPath, 'utf8');

const oldBillNum = 'billNumber: "(?:Invoice\\\\s*(?:No\\\\.?|Number)|Bill\\\\s*(?:No\\\\.?|Number)|Tax\\\\s*Invoice\\\\s*(?:No\\\\.?|Number))\\\\s*[:\\\\-]?\\\\s*([A-Za-z0-9\\\\-]+)"';
const newBillNum = 'billNumber: "(?:Invoice\\\\s*(?:No\\\\.?|Number)?|Bill\\\\s*(?:No\\\\.?|Number)?|Tax\\\\s*Invoice\\\\s*(?:No\\\\.?|Number)?)\\\\s*[:\\\\-]?\\\\s*([A-Za-z0-9\\\\-]+)"';

dict = dict.replace(oldBillNum, newBillNum);
fs.writeFileSync(dictPath, dict);
console.log('RegexDictionary.js updated');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const discomRegex = /\{\s*field:\s*"discom",\s*regex:\s*AU_RETAILERS[^}]+},\s*/;
if (discomRegex.test(btc)) {
  btc = btc.replace(discomRegex, '');
  fs.writeFileSync(btcPath, btc);
  console.log('Removed discom from auTemplate');
} else {
  console.log('Could not find discom field in auTemplate');
}
