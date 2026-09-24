const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Hoist extractedRawText
code = code.replace(
    "let isKnownAU = false;",
    "let isKnownAU = false;\n    let extractedRawText = '';"
);
code = code.replace(
    "const { text, isScanned } = await extractPdfText(req.file.buffer);",
    "const { text, isScanned } = await extractPdfText(req.file.buffer);\n        extractedRawText = text;"
);

// 2. Add validation function
const validationCode = `
      // Inject Preview Values
      const injectPreview = (templateArray) => {
        if (!extractedRawText) return templateArray;
        return templateArray.map(rule => {
          try {
            const isStrictCase = rule.field === 'fullName' || rule.field === 'consumerName';
            const regex = new RegExp(rule.regex, isStrictCase ? '' : 'i');
            const match = extractedRawText.match(regex);
            rule.previewValue = match ? match[1].trim() : 'Not Found';
          } catch(e) {
            rule.previewValue = 'Regex Error';
          }
          return rule;
        });
      };
`;

if (!code.includes('injectPreview')) {
    code = code.replace(
        "console.log(`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====`);",
        validationCode + "\n      const validatedAuTemplate = injectPreview(auTemplate);\n      console.log(`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====`);"
    );
    code = code.replace(
        "return res.status(200).json({ success: true, data: auTemplate });",
        "return res.status(200).json({ success: true, data: validatedAuTemplate });"
    );
    
    // Do the same for Gemini response
    code = code.replace(
        "console.log(`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====`);\n      console.log(JSON.stringify(parsed, null, 2));",
        "const validatedGeminiTemplate = injectPreview(parsed);\n      console.log(`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====`);\n      console.log(JSON.stringify(validatedGeminiTemplate, null, 2));"
    );
    code = code.replace(
        "return res.status(200).json({ success: true, data: parsed });",
        "return res.status(200).json({ success: true, data: validatedGeminiTemplate });"
    );
}

fs.writeFileSync(path, code);
console.log("Patched billTemplateController.js with Preview Injection!");
