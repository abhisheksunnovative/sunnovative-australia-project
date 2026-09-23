const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(path, 'utf8');

const targetLogs = /console\.log\(`\[TemplateExtractor\]\[\$\{rule\.field\}\] .*? Regex FAILED to match: \$\{rule\.regex\}`\);/g;
const replacementLogs = "console.log(`[TemplateExtractor][${rule.field}] FAILED MATCH. String length: ${rawText.length}, Regex used: ${regex}`);";

code = code.replace(targetLogs, replacementLogs);
fs.writeFileSync(path, code);
console.log("Patched templateExtractor to show regex failures");
