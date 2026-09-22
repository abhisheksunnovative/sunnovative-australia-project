import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

if (!content.includes('import { extractPdfText }')) {
    content = content.replace(
        "export const autoGenerateAliases",
        "import { extractPdfText } from '../utils/Ocrextractor.js';\n\nexport const autoGenerateAliases"
    );
}

const injectionPoint = "console.log('[Gemini Aliases] Sending file to Gemini...');";

const customLogic = `
    // Hybrid Strategy: Check if it's an Australian PDF to bypass Gemini completely and save quota
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
        { field: "monthlyBill", regex: "(?:Amount\\\\s*Due|Total\\\\s*Amount\\\\s*Due|Pay\\\\s*this\\\\s*amount)[\\\\s\\\\S]{0,10}?\\\\$?\\\\s*([0-9,]+\\\\.[0-9]{2})", type: "number", required: true },
        { field: "consumerNumber", regex: "(?:Account\\\\s*(?:Number|No\\\\.?|#)|Account\\\\s*:)[\\\\s:]*([A-Z0-9][A-Z0-9\\\\- ]{4,18}[A-Z0-9])", type: "string", required: true },
        { field: "tariffCategory", regex: "(Time of Use|Single Rate|TOU|Flat Rate|Peak|Off-Peak)", type: "string", required: false },
        { field: "quarterlyKwh", regex: "Average daily usage[\\\\s\\\\S]{0,10}?([0-9,.]+)\\\\s*kWh", type: "number", required: false },
        { field: "dueDate", regex: "(?:Due\\\\s*Date|Pay\\\\s*By)[\\\\s:]*([0-9]{1,2}\\\\s*[a-zA-Z]{3}\\\\s*[0-9]{2,4})", type: "string", required: false }
      ];
      return res.status(200).json({ success: true, data: auTemplate });
    }

    console.log('[Gemini Aliases] Sending file to Gemini...');`;

content = content.replace(injectionPoint, customLogic);

// Add 429 Quota Exceeded fallback in the catch block
const catchBlockOld = `} catch (err) {
        if (err.message && err.message.includes('503') && retries > 1) {`;

const catchBlockNew = `} catch (err) {
        if (err.message && err.message.includes('429')) {
          console.warn('[Gemini] 429 Quota Exceeded. Returning generic fallback template to prevent crash.');
          return res.status(200).json({ success: true, data: [
            { field: "monthlyBill", regex: "Total Amount(?: Payable)?\\\\s*([0-9.]+)", type: "number", required: true },
            { field: "consumerNumber", regex: "Account No\\\\s*([0-9A-Z]+)", type: "string", required: true }
          ]});
        }
        if (err.message && err.message.includes('503') && retries > 1) {`;

content = content.replace(catchBlockOld, catchBlockNew);

fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log('Successfully injected Hybrid Fallback logic into autoGenerateAliases');
