import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const oldPromptBlock = `    const prompt = \`You are an expert OCR template generator for Indian electricity bills (DISCOMs). 
Analyze the provided bill image/pdf. Identify the EXACT textual labels/headings printed on the bill that correspond to the following standard fields.
Return a valid JSON object where the keys are the standard fields, and the values are ARRAYS of strings (the exact labels found on the bill, e.g. ["Account No", "Customer No"]).

Required Schema:
{
  "consumer_number": ["string"],
  "units_consumed": ["string"],
  "total_bill": ["string"],
  "billing_period": ["string"],
  "due_date": ["string"],
  "customer_name": ["string"],
  "discom_name": ["string"],
  "tariff": ["string"],
  "consumer_type": ["string"]
}\`;`;

const newPromptBlock = `    const prompt = \`You are an expert OCR template generator. Analyze the provided utility bill image.
Create Regex extraction rules to reliably extract the following fields using Javascript regex (with 1 capture group for the value).
Ensure the regex handles extra spaces and newlines if necessary. Escape backslashes properly for JSON.

Return a JSON array of objects strictly following this schema:
[
  {
    "field": "monthlyBill",
    "regex": "Total Amount(?: Payable)?\\\\s*([0-9.]+)",
    "type": "number",
    "required": true
  },
  { "field": "consumerNumber", "regex": "Account No\\\\s*([0-9A-Z]+)", "type": "string", "required": true }
]

Only map these standard fields if you find them: monthlyBill, quarterlyKwh, monthlyUnits, consumerNumber, fullName, tariffCategory, dueDate, meterTypeInfo, state.
Return raw JSON array only.\`;`;

content = content.replace(oldPromptBlock, newPromptBlock);

// Also replace gemini-3.6-flash which doesn't exist to gemini-1.5-flash
content = content.replace("model: 'gemini-3.6-flash'", "model: 'gemini-1.5-flash'");

fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("billTemplateController.js updated for Regex Autogeneration.");
