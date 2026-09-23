const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const logStr = "console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');";
const newLogStr = `console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');
      console.log(\`[Gemini Aliases] Returning \${auTemplate.length} predefined Regex Fields for UI.\`);`;

if (btc.includes(logStr)) {
  btc = btc.replace(logStr, newLogStr);
  fs.writeFileSync(btcPath, btc);
  console.log('Added logs to billTemplateController');
}

const tePath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let te = fs.readFileSync(tePath, 'utf8');

const extractLogStr = `if (val !== null) {
                        extractedData[rule.field] = val;`;
const newExtractLogStr = `if (val !== null) {
                        console.log(\`[TemplateExtractor] Field "\${rule.field}" MATCHED successfully: \${val}\`);
                        extractedData[rule.field] = val;`;

if (te.includes(extractLogStr)) {
  te = te.replace(extractLogStr, newExtractLogStr);
  fs.writeFileSync(tePath, te);
  console.log('Added logs to templateExtractor');
}
