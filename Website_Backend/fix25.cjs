const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const oldLog = `console.log(\`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.\`);`;
const newLog = `console.log(\`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.\`);
      console.log(\`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====\`);
      console.log(JSON.stringify(auTemplate, null, 2));
      console.log(\`============================================================\`);`;

if (btc.includes(oldLog)) {
  btc = btc.replace(oldLog, newLog);
  fs.writeFileSync(btcPath, btc);
  console.log('Added template JSON log to billTemplateController');
} else if (btc.includes(oldLog.replace(/\n/g, '\r\n'))) {
  btc = btc.replace(oldLog.replace(/\n/g, '\r\n'), newLog.replace(/\n/g, '\r\n'));
  fs.writeFileSync(btcPath, btc);
  console.log('Added template JSON log to billTemplateController (CRLF)');
} else {
  console.log('Could not find log target in billTemplateController');
}
