const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Disable Gemini completely for AU templates in autoGenerateAliases
const targetBlock = `    if (isKnownAU) {
      console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');`;

const replacementBlock = `    if (req.body.country === 'australia' || req.body.country === 'nz') {
      console.log('[Gemini Aliases] AU/NZ detected. Bypassing Gemini completely for template builder.');
      
      const auTemplate = [
        { field: "fullName", regex: AU_DICT.namePatterns.join('|'), type: "string", required: false },
        { field: "consumerNumber", regex: AU_DICT.accountNumber, type: "string", required: false },
        { field: "consumerBillNumber", regex: AU_DICT.billNumber, type: "string", required: false },
        { field: "meterCategory", regex: "(Smart\\\\s*Meter|Interval|Basic\\\\s*Meter|Accumulation\\\\s*Meter)", type: "string", required: false },
        { field: "tariffCategory", regex: AU_DICT.tariffCategory, type: "string", required: false },
        { field: "monthlyBill", regex: AU_DICT.amountPatterns.join('|'), type: "number", required: true },
        { field: "billIssuedDate", regex: AU_DICT.billIssueDate, type: "string", required: false },
        { field: "quarterlyKwh", regex: AU_DICT.usagePatterns.join('|'), type: "number", required: false },
        { field: "state", regex: "(?:VIC|NSW|QLD|WA|SA|TAS|ACT|NT|Victoria|New\\\\s*South\\\\s*Wales|Queensland|Western\\\\s*Australia|South\\\\s*Australia|Tasmania)", type: "string", required: false },
        { field: "dueDate", regex: AU_DICT.dueDate, type: "string", required: false }
      ];
      
      return res.status(200).json({ 
        success: true, 
        data: auTemplate,
        rawText: extractedRawText,
        message: 'Pre-filled baseline dictionary for AU/NZ. Use manual highlighter to refine rules.'
      });
    }

    if (isKnownAU) {
      console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');`;

code = code.replace(targetBlock, replacementBlock);

fs.writeFileSync(path, code);
console.log("Fixed: AU completely bypasses Gemini for auto-generating template fields.");
