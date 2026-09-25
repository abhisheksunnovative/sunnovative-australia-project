const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'const { rawText, selectedText, fieldName, override } = req.body;',
    'const { rawText, selectedText, fieldName, override, ruleType } = req.body;'
);

code = code.replace(
    "} else if (fieldName === 'state') {\n      captureGroup = '([A-Za-z]{2,5})';\n    }",
    "} else if (fieldName === 'state') {\n      captureGroup = '([A-Za-z]{2,5})';\n    }\n    if (ruleType === 'split-currency') {\n      captureGroup = '([0-9,]+)\\\\s+([0-9]{1,2})\\\\b';\n    }"
);

code = code.replace(
    "if (match) previewValue = match[1] ? match[1].trim() : match[0].trim();",
    "if (match) {\n            if (ruleType === 'split-currency' && match[1] && match[2]) {\n                previewValue = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();\n            } else {\n                previewValue = match[1] ? match[1].trim() : match[0].trim();\n            }\n        }"
);

fs.writeFileSync(file, code);
console.log("Patched backend for Split Currency");
