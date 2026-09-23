const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const badBlock = `console.log(\`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.\`);
      console.log(\`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====\`);
      console.log(JSON.stringify(auTemplate, null, 2));
      console.log(\`============================================================\`);
      const auTemplate = [`;

const goodBlock = `console.log(\`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.\`);
      const auTemplate = [`;

const insertionTarget = `      ];
      return res.status(200).json({ success: true, data: auTemplate });`;

const newInsertion = `      ];
      console.log(\`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====\`);
      console.log(JSON.stringify(auTemplate, null, 2));
      console.log(\`============================================================\`);
      return res.status(200).json({ success: true, data: auTemplate });`;

if (btc.includes(badBlock)) {
  btc = btc.replace(badBlock, goodBlock);
  btc = btc.replace(insertionTarget, newInsertion);
  fs.writeFileSync(btcPath, btc);
  console.log('Fixed log placement in billTemplateController');
} else if (btc.includes(badBlock.replace(/\n/g, '\r\n'))) {
  btc = btc.replace(badBlock.replace(/\n/g, '\r\n'), goodBlock.replace(/\n/g, '\r\n'));
  btc = btc.replace(insertionTarget.replace(/\n/g, '\r\n'), newInsertion.replace(/\n/g, '\r\n'));
  fs.writeFileSync(btcPath, btc);
  console.log('Fixed log placement in billTemplateController (CRLF)');
} else {
  console.log('Could not find bad block');
}
