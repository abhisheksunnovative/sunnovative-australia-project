const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `const validatedTemplate = injectPreview(templateFields);
    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText });`;

const replacement = `const validatedTemplate = injectPreview(templateFields);
    
    let suggestedAnchor = '';
    if (extractedRawText) {
        const topText = extractedRawText.substring(0, 300);
        const anchors = [];
        
        // Try to find acronyms like PGVCL, PSPCL
        const acronymMatch = topText.match(/\\b([A-Z]{4,6})\\b/);
        if (acronymMatch && !['DATE', 'BILL', 'TAX', 'GST', 'INVOICE'].includes(acronymMatch[1])) {
            anchors.push(acronymMatch[1]);
        }
        
        // Try to find company names
        const companyMatch = topText.match(/([A-Z][A-Za-z\\s]{5,40}(?:Limited|Ltd|Company|Power|Energy|Board|Corporation|Vidyut|Vitran))\\b/i);
        if (companyMatch) {
            anchors.push(companyMatch[1].trim());
        }
        
        suggestedAnchor = anchors.join(', ');
    }

    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText, suggestedAnchor });`;

code = code.replace(targetStr, replacement);
fs.writeFileSync(file, code);
console.log("Patched backend for suggestedAnchor");
