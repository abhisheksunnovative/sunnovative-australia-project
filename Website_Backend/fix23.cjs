const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const badLog = `console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');
      console.log(\`[Gemini Aliases] Returning \${auTemplate.length} predefined Regex Fields for UI.\`);`;

const fixedLog = `console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');
      console.log(\`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.\`);`;

if (btc.includes(badLog)) {
  btc = btc.replace(badLog, fixedLog);
  fs.writeFileSync(btcPath, btc);
  console.log('Fixed ReferenceError in billTemplateController');
} else if (btc.includes(badLog.replace(/\n/g, '\r\n'))) {
  btc = btc.replace(badLog.replace(/\n/g, '\r\n'), fixedLog.replace(/\n/g, '\r\n'));
  fs.writeFileSync(btcPath, btc);
  console.log('Fixed ReferenceError in billTemplateController (CRLF)');
} else {
  console.log('Could not find bad log');
}
