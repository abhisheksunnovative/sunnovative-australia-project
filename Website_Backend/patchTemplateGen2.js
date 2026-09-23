import fs from 'fs';
let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const auTemplateRegex = /const auTemplate = \[[\s\S]*?\];/m;

const auTemplateNew = `const auTemplate = [
        { field: "monthlyBill", regex: "(?:Total\\\\s*Amount\\\\s*(?:Due|Payable)|Amount\\\\s*(?:Due|Payable)|Balance\\\\s*Due|Please\\\\s*Pay|Total)[\\\\s\\\\S]{0,80}?\\\\$\\\\s*([\\\\d,]+(?:\\\\.\\\\d{2})?)", type: "number", required: true },
        { field: "consumerNumber", regex: "(?:Account\\\\s*(?:Number|No\\\\.?|#)|Account\\\\s*:)[\\\\s:]*([A-Z0-9][A-Z0-9\\\\- ]{4,18}[A-Z0-9])", type: "string", required: true },
        { field: "tariffCategory", regex: "(?:Tariff(?:\\\\s*:|\\\\s*-)?\\\\s+|Your\\\\s*Current\\\\s*Agreement\\\\s*:\\\\s*\\\\n?\\\\s*|Current\\\\s*Account\\\\s*Charges\\\\s*\\\\n\\\\s*)([^\\\\n]{4,30})", type: "string", required: false },
        { field: "quarterlyKwh", regex: "(?:Energy\\\\s*Use|Total\\\\s*(?:Electricity\\\\s*)?(?:Usage|Used|Consumption)|This\\\\s*bill\\\\s*[:\\\\-]?)[\\\\s\\\\S]{0,40}?([\\\\d,]+(?:\\\\.\\\\d+)?)\\\\s*(?:kWh|kW|units)?", type: "number", required: false },
        { field: "dueDate", regex: "(?:Due\\\\s*Date|Pay\\\\s*By)[\\\\s:]*([0-9]{1,2}\\\\s*[a-zA-Z]{3}\\\\s*[0-9]{2,4})", type: "string", required: false }
      ];`;

if (auTemplateRegex.test(content)) {
  content = content.replace(auTemplateRegex, auTemplateNew);
  fs.writeFileSync('src/controllers/billTemplateController.js', content);
  console.log("Template generator patched using regex!");
} else {
  console.log("Template generator regex did not match!");
}
