import fs from 'fs';
let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const auTemplateOld = `      const auTemplate = [
        { field: "monthlyBill", regex: "(?:Amount\\s*Due|Total\\s*Amount\\s*Due|Pay\\s*this\\s*amount)[\\s\\S]{0,10}?\\$?\\s*([0-9,]+\\.[0-9]{2})", type: "number", required: true },
        { field: "consumerNumber", regex: "(?:Account\\s*(?:Number|No\\.?|#)|Account\\s*:)[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])", type: "string", required: true },
        { field: "tariffCategory", regex: "(Time of Use|Single Rate|TOU|Flat Rate|Peak|Off-Peak)", type: "string", required: false },
        { field: "quarterlyKwh", regex: "Average daily usage[\\s\\S]{0,10}?([0-9,.]+)\\s*kWh", type: "number", required: false },
        { field: "dueDate", regex: "(?:Due\\s*Date|Pay\\s*By)[\\s:]*([0-9]{1,2}\\s*[a-zA-Z]{3}\\s*[0-9]{2,4})", type: "string", required: false }
      ];`;

const auTemplateNew = `      // Advanced, robust generic template for AU to avoid breaking scans
      const auTemplate = [
        { field: "monthlyBill", regex: "(?:Total\\s*Amount\\s*(?:Due|Payable)|Amount\\s*(?:Due|Payable)|Balance\\s*Due|Please\\s*Pay|Total)[\\s\\S]{0,80}?\\$\\s*([\\d,]+(?:\\.\\d{2})?)", type: "number", required: true },
        { field: "consumerNumber", regex: "(?:Account\\s*(?:Number|No\\.?|#)|Account\\s*:)[\\s:]*([A-Z0-9][A-Z0-9\\- ]{4,18}[A-Z0-9])", type: "string", required: true },
        { field: "tariffCategory", regex: "(?:Tariff(?:\\s*:|\\s*-)?\\s+|Your\\s*Current\\s*Agreement\\s*:\\s*\\n?\\s*|Current\\s*Account\\s*Charges\\s*\\n\\s*)([^\\n]{4,30})", type: "string", required: false },
        { field: "quarterlyKwh", regex: "(?:Energy\\s*Use|Total\\s*(?:Electricity\\s*)?(?:Usage|Used|Consumption)|This\\s*bill\\s*[:\\-]?)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)?", type: "number", required: false },
        { field: "dueDate", regex: "(?:Due\\s*Date|Pay\\s*By)[\\s:]*([0-9]{1,2}\\s*[a-zA-Z]{3}\\s*[0-9]{2,4})", type: "string", required: false }
      ];`;

if (content.includes(auTemplateOld)) {
  content = content.replace(auTemplateOld, auTemplateNew);
  fs.writeFileSync('src/controllers/billTemplateController.js', content);
  console.log("Template generator patched!");
} else {
  console.log("Template generator old string not found!");
}
