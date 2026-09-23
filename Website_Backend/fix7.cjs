const fs = require('fs');

const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');

const importStr = "import { AU_RETAILERS, AU_DICT } from '../utils/RegexDictionary.js';\n";
btc = btc.replace("import { extractPdfText } from '../utils/Ocrextractor.js';", importStr + "import { extractPdfText } from '../utils/Ocrextractor.js';");

const oldAUBillLogic = `    // Hybrid Strategy: Check if it's an Australian PDF to bypass Gemini completely and save quota
    let isAUBill = false;
    if (req.file.mimetype === 'application/pdf') {
      try {
        const { text, isScanned } = await extractPdfText(req.file.buffer);
        if (!isScanned && (text.includes("ABN") || text.includes("Western Australia") || text.match(/(AGL|Origin|Alinta|EnergyAustralia|Synergy|Powercor|Citipower)/i))) {
          isAUBill = true;
        }
      } catch (e) {
        console.error("PDF extraction fail for AU check", e);
      }
    }

    if (isAUBill) {
      console.log('[Gemini Aliases] Detected AU PDF. Bypassing Gemini to save API quota.');
      const auTemplate = [
        { field: "monthlyBill", regex: "(?:Total\\\\s*Amount\\\\s*(?:Due|Payable)|Amount\\\\s*(?:Due|Payable)|Balance\\\\s*Due|Please\\\\s*Pay|Total)[\\\\s\\\\S]{0,80}?\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)", type: "number", required: true },
        { field: "consumerNumber", regex: "(?:Account\\\\s*(?:Number|No\\\\.?|#)|Account\\\\s*:)[\\\\s:]*([A-Z0-9][A-Z0-9\\\\- ]{4,18}[A-Z0-9])", type: "string", required: true },
        { field: "tariffCategory", regex: "(?:Your\\\\s*tariff\\\\s*:\\\\s*|Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([^\\\\n]{4,30})", type: "string", required: false },
        { field: "quarterlyKwh", regex: "(?:Energy\\\\s*Use|Total\\\\s*(?:Electricity\\\\s*)?(?:Usage|Used|Consumption)|This\\\\s*bill\\\\s*[:\\\\-]?)[\\\\s\\\\S]{0,40}?([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*(?:kWh|kW|units)?", type: "number", required: false },
        { field: "dueDate", regex: "(?:Due\\\\s*Date|Pay\\\\s*By)[\\\\s:]*([0-9]{1,2}\\\\s*[a-zA-Z]{3}\\\\s*[0-9]{2,4})", type: "string", required: false }
      ];
      return res.status(200).json({ success: true, data: auTemplate });
    }`;

const newAUBillLogic = `    // Hybrid Strategy: Check if it's a known AU Retailer to bypass Gemini completely and save quota
    let isKnownAU = false;
    if (req.file.mimetype === 'application/pdf') {
      try {
        const { text, isScanned } = await extractPdfText(req.file.buffer);
        if (!isScanned) {
          for (const r of AU_RETAILERS) {
            if (r.pattern.test(text)) {
              isKnownAU = true;
              break;
            }
          }
        }
      } catch (e) {
        console.error("PDF extraction fail for AU check", e);
      }
    }

    if (isKnownAU) {
      console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');
      const auTemplate = [
        { field: "monthlyBill", regex: AU_DICT.monthlyBill, type: "number", required: true },
        { field: "consumerNumber", regex: AU_DICT.accountNumber, type: "string", required: true },
        { field: "tariffCategory", regex: AU_DICT.tariffCategory, type: "string", required: false },
        { field: "quarterlyKwh", regex: AU_DICT.quarterlyKwh, type: "number", required: false },
        { field: "dueDate", regex: AU_DICT.dueDate, type: "string", required: false }
      ];
      return res.status(200).json({ success: true, data: auTemplate });
    }`;

if (btc.includes(oldAUBillLogic)) {
  btc = btc.replace(oldAUBillLogic, newAUBillLogic);
} else {
  btc = btc.replace(oldAUBillLogic.replace(/\n/g, '\r\n'), newAUBillLogic);
}

fs.writeFileSync(btcPath, btc);
console.log('billTemplateController patched.');
