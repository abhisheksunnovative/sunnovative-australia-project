const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const targetAutoExtract = `    let extractedRawText = '';
    try {
        const { rawText: text, wordsWithPositions } = await extractRawText(req.file.buffer, req.file.mimetype);
        extractedRawText = text;
    } catch (e) {`;

const newAutoExtract = `    let extractedRawText = '';
    let globalWords = null;
    try {
        const { rawText: text, wordsWithPositions } = await extractRawText(req.file.buffer, req.file.mimetype);
        extractedRawText = text;
        globalWords = wordsWithPositions;
    } catch (e) {`;

code = code.replace(targetAutoExtract, newAutoExtract);

const targetReturn = `    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText, suggestedAnchor });`;
const newReturn = `    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText, suggestedAnchor, wordsWithPositions: globalWords });`;

code = code.replace(targetReturn, newReturn);

fs.writeFileSync(file, code);
console.log("Updated autoGenerateAliases");
