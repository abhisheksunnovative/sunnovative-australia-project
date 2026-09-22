import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const regex = /export const autoGenerateAliases = async \(req, res\) => \{[\s\S]*?\n\};\n?/m;

const newFunc = `export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing in .env' });
    }
    
    // Import GoogleGenerativeAI dynamically if needed, assuming it's available in module scope
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = \`You are an expert OCR template generator. Analyze the provided utility bill image.
Create Regex extraction rules to reliably extract the following fields using Javascript regex (with 1 capture group for the value).
Ensure the regex handles extra spaces and newlines if necessary. Escape backslashes properly for JSON (e.g. \\\\\\\\s*).

Return a JSON array of objects strictly following this schema:
[
  {
    "field": "monthlyBill",
    "regex": "Total Amount(?: Payable)?\\\\\\\\s*([0-9.]+)",
    "type": "number",
    "required": true
  },
  { "field": "consumerNumber", "regex": "Account No\\\\\\\\s*([0-9A-Z]+)", "type": "string", "required": true }
]

Only map these standard fields if you find them: monthlyBill, quarterlyKwh, monthlyUnits, consumerNumber, fullName, tariffCategory, dueDate, meterTypeInfo, state.
Return raw JSON array only.\`;

    const imageParts = [{
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype === 'application/pdf' ? 'application/pdf' : req.file.mimetype,
      },
    }];

    console.log('[Gemini Aliases] Sending file to Gemini...');
    const result = await model.generateContent([prompt, ...imageParts]);
    let jsonString = result.response.text().trim();
    
    if (jsonString.startsWith('\`\`\`json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('\`\`\`')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('\`\`\`')) jsonString = jsonString.slice(0, -3);

    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.slice(firstBracket, lastBracket + 1);
    }

    let parsed = [];
    try {
      parsed = JSON.parse(jsonString.trim());
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch (parseErr) {
      console.error('[Gemini Aliases] JSON parse failed:', parseErr.message);
      return res.status(200).json({ success: true, data: [] });
    }

    console.log('[Gemini Aliases] ✅ success');
    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error auto-generating aliases with Gemini:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};
`;

content = content.replace(regex, newFunc);
fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("Controller autoGenerateAliases completely replaced with ES Module.");
