const fs = require('fs');

// 1. lightBillScanController.js
const scanFile = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let scanCode = fs.readFileSync(scanFile, 'utf8');

scanCode = scanCode.replace(
    `const { rawText, usedOCR } = await billParser.extractRawText(fileBuffer, mimeType);`,
    `const { rawText, usedOCR, wordsWithPositions } = await billParser.extractRawText(fileBuffer, mimeType);`
);

scanCode = scanCode.replace(
    `const extractionResult = await templateExtractor.extractData(rawText, countryContext);`,
    `const extractionResult = await templateExtractor.extractData(rawText, countryContext, wordsWithPositions);`
);

fs.writeFileSync(scanFile, scanCode);
console.log("Updated lightBillScanController.js");

// 2. billTemplateController.js
const tmplFile = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let tmplCode = fs.readFileSync(tmplFile, 'utf8');

tmplCode = tmplCode.replace(
    `const { rawText: text } = await extractRawText(req.file.buffer, req.file.mimetype);`,
    `const { rawText: text, wordsWithPositions } = await extractRawText(req.file.buffer, req.file.mimetype);`
);

tmplCode = tmplCode.replace(
    `res.status(200).json({ success: true, data: templateFields, rawTextPreview: text });`,
    `res.status(200).json({ success: true, data: templateFields, rawTextPreview: text, wordsWithPositions: wordsWithPositions });`
);

fs.writeFileSync(tmplFile, tmplCode);
console.log("Updated billTemplateController.js");
