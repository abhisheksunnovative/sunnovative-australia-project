const fs = require('fs');

let code = fs.readFileSync('Website_Backend/src/controllers/billTemplateController.js', 'utf8');

code += `

import { GoogleGenerativeAI } from '@google/generative-ai';

export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });

    const prompt = \`
You are an expert OCR template generator for electricity bills. 
Analyze the provided bill image/pdf. Identify the EXACT textual labels/headings printed on the bill that correspond to the following standard fields.
Return a valid JSON object where the keys are the standard fields, and the values are ARRAYS of strings (the exact labels found on the bill, e.g. ["Account No", "Customer No"]).

Required Schema:
{
  "consumer_number": ["string"],
  "units_consumed": ["string"],
  "total_bill": ["string"],
  "billing_period": ["string"],
  "due_date": ["string"],
  "customer_name": ["string"]
}
\`;

    const imageParts = [{
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype === 'application/pdf' ? 'application/pdf' : req.file.mimetype,
      },
    }];

    const result = await model.generateContent([prompt, ...imageParts]);
    let jsonString = result.response.text().trim();
    if (jsonString.startsWith('\`\`\`json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('\`\`\`')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('\`\`\`')) jsonString = jsonString.slice(0, -3);

    const parsed = JSON.parse(jsonString.trim());
    
    // Default fallback if some keys are missing
    const finalAliases = {
      consumer_number: parsed.consumer_number || [],
      units_consumed: parsed.units_consumed || [],
      total_bill: parsed.total_bill || [],
      billing_period: parsed.billing_period || [],
      due_date: parsed.due_date || [],
      customer_name: parsed.customer_name || []
    };

    res.status(200).json({ success: true, data: finalAliases });
  } catch (error) {
    console.error('Error auto-generating aliases:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};
`;

fs.writeFileSync('Website_Backend/src/controllers/billTemplateController.js', code);
