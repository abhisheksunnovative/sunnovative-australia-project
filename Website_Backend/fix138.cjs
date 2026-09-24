const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(path, 'utf8');

const targetLog = `console.log(\`[TemplateExtractor] Matched Template: \${matchedTemplate.discomName}\`);`;
const replacementLog = `console.log(\`\\n======================================================\`);
        console.log(\`[TemplateExtractor] 🌟 USING YOUR SAVED TEMPLATE: \${matchedTemplate.discomName}\`);
        console.log(\`[TemplateExtractor] 🕒 Template Last Updated: \${matchedTemplate.updatedAt}\`);
        console.log(\`[TemplateExtractor] 📏 Total Rules Inside: \${matchedTemplate.extractionRules.length}\`);
        console.log(\`======================================================\\n\`);`;

code = code.replace(targetLog, replacementLog);
fs.writeFileSync(path, code);
console.log("Added clear logs for template matching.");
