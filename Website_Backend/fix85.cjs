const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const cutoffIndex = code.indexOf('// 5. Generate Regex from Highlighted Text');
if (cutoffIndex !== -1) {
  code = code.substring(0, cutoffIndex);
}

const safeRegexGeneratorFunc = `// 5. Generate Regex from Highlighted Text
export const generateRegexFromSelection = async (req, res) => {
  try {
    const { rawText, selectedText, fieldName } = req.body;
    if (!rawText || !selectedText) {
      return res.status(400).json({ success: false, message: 'Missing rawText or selectedText' });
    }

    const index = rawText.indexOf(selectedText);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Selected text not found in the bill.' });
    }

    // Grab up to 80 chars of preceding context
    const precedingText = rawText.substring(Math.max(0, index - 80), index).trim();
    
    // Find the last word that has letters (e.g. 'Total', 'Due', 'bill')
    const words = precedingText.split(/[^a-zA-Z0-9]+/);
    let anchor = '';
    for (let i = words.length - 1; i >= 0; i--) {
        if (words[i].length > 2 && /[a-zA-Z]/.test(words[i])) {
            anchor = words[i];
            break;
        }
    }
    
    if (!anchor && words.length > 0) anchor = words[words.length - 1];

    // Escape the anchor
    const escapeRegex = (str) => str.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
    anchor = escapeRegex(anchor);

    // Build the specific capture group
    let captureGroup = "(.*?)";
    
    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
      captureGroup = "([0-9,]+(?:\\\\.[0-9]+)?)";
    } else if (fieldName === 'dueDate' || fieldName === 'billIssuedDate') {
      if (selectedText.match(/[a-zA-Z]/)) {
        captureGroup = "([0-9]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+[0-9]{2,4})";
      } else {
        captureGroup = "([0-9\\\\/-]{8,10})";
      }
    } else if (fieldName === 'consumerNumber' || fieldName === 'consumerBillNumber') {
      captureGroup = "([A-Za-z0-9\\\\- ]{3,25})";
    } else if (fieldName === 'fullName') {
      captureGroup = "([A-Z][A-Za-z0-9\\\\s.&-]{2,40})";
    }

    let regexStr = "";
    if (anchor) {
      regexStr = "(?:" + anchor + ")[\\\\s\\\\S]{0,120}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\\\\d+/g, '\\\\d+');
    }

    let extracted = "Not Found";
    
    // Attempt Gemini if it's available, otherwise fallback
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
        
        const prompt = \`
          You are an expert at writing JavaScript Regular Expressions for OCR text extraction.
          I have a bill's raw OCR text. The user has highlighted the value for the field "\${fieldName}".
          The highlighted value is: "\${selectedText}"
          The 80 characters immediately preceding this value are:
          ---
          \${precedingText}
          ---
          
          Write a robust regular expression that will extract this exact value.
          Rules:
          1. Use an anchor word from the preceding text (like "Total", "Name", "Date", etc).
          2. Allow a gap of [\\\\s\\\\S]{0,150}? between the anchor and the value.
          3. Put the value in the FIRST capture group.
          4. Return ONLY a JSON object: {"regex": "your_regex_string"}
          5. Do not include start/end slashes or flags in the string.
        \`;
        
        const result = await model.generateContent(prompt);
        const textResp = result.response.text();
        const jsonMatch = textResp.match(/\\{.*\\}/s);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.regex) regexStr = parsed.regex;
        }
    } catch(err) {
        console.warn("Gemini regex generation failed, using math fallback regex", err.message);
    }

    try {
      const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
      const testRegex = new RegExp(regexStr, isStrictCase ? '' : 'i');
      const match = rawText.match(testRegex);
      if (match) {
         extracted = match[1] ? match[1].trim() : match[0].trim();
      }
    } catch (e) {
      extracted = "Invalid Regex Generated";
    }

    res.status(200).json({ success: true, data: { regex: regexStr, previewValue: extracted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

fs.writeFileSync(path, code + safeRegexGeneratorFunc);
console.log("Restored Gemini + Math Fallback!");
