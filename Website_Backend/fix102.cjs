const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Remove duplicate injectPreview definition if it exists inside isKnownAU
const oldInjectPreview = `        // Inject Preview Values
        const injectPreview = (templateArray) => {
          if (!extractedRawText) return templateArray;
          return templateArray.map(rule => {
            try {
              const isStrictCase = rule.field === 'fullName' || rule.field === 'fullName';
              const regex = new RegExp(rule.regex, isStrictCase ? '' : 'i');
              const match = extractedRawText.match(regex);
              if (match) {
                const val = match.slice(1).find(v => v !== undefined);
                rule.previewValue = val ? val.trim() : match[0].trim();
              } else {
                rule.previewValue = 'Not Found';
              }
            } catch(e) {
              rule.previewValue = 'Regex Error';
            }
            return rule;
          });
        };`;

code = code.replace(oldInjectPreview, '');

fs.writeFileSync(path, code);
console.log("Cleaned up duplicate injectPreview.");
