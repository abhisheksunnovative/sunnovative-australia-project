const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const startStr = "export const autoGenerateAliases = async (req, res) => {";
const endStr = "// PATCH /api/admin/bill-templates/:id/approve";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.log("Markers not found");
    process.exit(1);
}

const newBody = `export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isAU = req.body.country === 'australia' || req.body.country === 'AU' || (req.headers['x-country'] || '').toLowerCase() === 'australia';
    
    let extractedRawText = '';
    try {
        const { rawText: text } = await extractRawText(req.file.buffer, req.file.mimetype);
        extractedRawText = text;
    } catch (e) {
        console.error("PDF extraction fail", e);
    }

    console.log('[Aliases Builder] Bypassing Gemini to save API quota. Generating manual template for:', isAU ? 'AU' : 'IN');
    
    let templateFields = [];
    if (isAU) {
        templateFields = [
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
    } else {
        templateFields = [
            { field: "fullName", regex: "Name(?:[:\\\\-\\\\s]+)([A-Za-z\\\\s]+)", type: "string", required: false },
            { field: "consumerNumber", regex: "(?:Consumer\\\\s*No|Account\\\\s*No|K\\\\.NO|Consumer\\\\s*Number)[\\\\s:.]*([0-9A-Z]+)", type: "string", required: false },
            { field: "tariffCategory", regex: "(?:Tariff|Category|Tariff\\\\s*Category)[\\\\s:.]*([A-Za-z0-9\\\\-]+)", type: "string", required: false },
            { field: "monthlyBill", regex: "(?:Total\\\\s*Amount|Net\\\\s*Amount|Amount\\\\s*Payable)[\\\\s:.]*(?:Rs\\\\.?|₹)?\\\\s*([0-9,.]+)", type: "number", required: true },
            { field: "billIssuedDate", regex: "(?:Bill\\\\s*Date|Issue\\\\s*Date)[\\\\s:.]*([0-9]{2}[\\\\/\\\\-][0-9]{2}[\\\\/\\\\-][0-9]{2,4})", type: "string", required: false },
            { field: "monthlyUnits", regex: "(?:Units\\\\s*Consumed|Billed\\\\s*Units|Consumption)[\\\\s:.]*([0-9]+)", type: "number", required: false },
            { field: "dueDate", regex: "(?:Due\\\\s*Date)[\\\\s:.]*([0-9]{2}[\\\\/\\\\-][0-9]{2}[\\\\/\\\\-][0-9]{2,4})", type: "string", required: false },
            { field: "state", regex: "(Gujarat|Maharashtra|Delhi|Haryana|Punjab|Rajasthan)", type: "string", required: false },
            { field: "discomId", regex: "(PGVCL|MGVCL|UGVCL|DGVCL|MSEDCL|DHBVN|UHBVN)", type: "string", required: false }
        ];
    }

    // Inject Preview Values
    const injectPreview = (templateArray) => {
        if (!extractedRawText) return templateArray;
        return templateArray.map(rule => {
            try {
                const isStrictCase = rule.field === 'fullName';
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
    };

    const validatedTemplate = injectPreview(templateFields);
    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText });
  } catch (error) {
    console.error('Error auto-generating aliases without Gemini:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};

`;

code = code.substring(0, startIndex) + newBody + code.substring(endIndex);

fs.writeFileSync(file, code);
console.log("Replaced autoGenerateAliases successfully");
