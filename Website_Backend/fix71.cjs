const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Update createTemplate to force engineVersion and isActive
code = code.replace(
    "const template = await BillTemplate.create(req.body);",
    "req.body.engineVersion = 'v2.4_latest';\n      req.body.isActive = true;\n      const template = await BillTemplate.create(req.body);"
);

// Update updateTemplate to force engineVersion and isActive
code = code.replace(
    "const template = await BillTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });",
    "req.body.engineVersion = 'v2.4_latest';\n      req.body.isActive = true;\n      const template = await BillTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });"
);

// Add generateRegexFromSelection
const selectionApi = `
// 5. Generate Regex from Highlighted Text
export const generateRegexFromSelection = async (req, res) => {
  try {
    const { rawText, selectedText, fieldName } = req.body;
    if (!rawText || !selectedText) {
      return res.status(400).json({ success: false, message: 'Missing rawText or selectedText' });
    }

    // Escape regex characters in the selected text
    const escapedSelection = selectedText.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');

    // Find the position of the selected text in the raw text
    const index = rawText.indexOf(selectedText);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Selected text not found in the bill.' });
    }

    // Grab up to 60 characters of preceding context
    const precedingText = rawText.substring(Math.max(0, index - 60), index);
    
    // Find the last stable anchor word in the preceding text (alphanumeric block)
    const contextWords = precedingText.trim().split(/\\s+/);
    let anchor = '';
    if (contextWords.length > 0) {
      const lastWord = contextWords[contextWords.length - 1];
      // Escape anchor
      anchor = lastWord.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
    }

    // Construct a safe regex: anchor followed by a gap, then capturing the exact selection format
    // Replace digits in the selection with a digit pattern to make it generic for future bills
    const generalizedSelection = escapedSelection.replace(/\\d+/g, '\\\\d+');
    
    let regexStr = "";
    if (anchor) {
      regexStr = anchor + "[\\\\s\\\\S]{0,100}?" + generalizedSelection; // Fallback naive regex
      
      // If we are looking for a number/amount, capture it
      if (fieldName === 'monthlyBill' || fieldName === 'quarterlyKwh') {
        const captureNum = "([\\\\d,]+(?:\\\\.\\\\d+)?)";
        regexStr = anchor + "[\\\\s\\\\S]{0,100}?(" + captureNum + ")"; // Generic fallback, but let's just ask Gemini for real
      }
    } else {
       regexStr = generalizedSelection;
    }

    // Call Gemini to generate a smart regex based on context!
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: 'application/json' } });
      
      const prompt = \`
You are an OCR expert building javascript RegExp strings.
The user highlighted this exact value from an electricity bill: "\${selectedText}"
The preceding context on the bill was: "\${precedingText}"

Generate a robust regex to capture this exact field for FUTURE bills from the same company. 
Rules:
1. Use preceding labels (like "Total Due:" or "Account:") as anchors.
2. Use [\\\\s\\\\S]{0,100}? for gaps between the label and the value to account for layout shifts.
3. The value itself should be captured in group 1, e.g. ([0-9,.]+)
4. ONLY return a JSON object like {"regex": "YourRegexString"}. Double escape backslashes so it parses correctly in JSON (e.g. \\\\s becomes \\\\\\\\s).
\`;
      const result = await model.generateContent(prompt);
      let jsonString = result.response.text().trim();
      const firstBracket = jsonString.indexOf('{');
      const lastBracket = jsonString.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
        jsonString = jsonString.slice(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(jsonString);
        if (parsed.regex) {
          regexStr = parsed.regex;
        }
      }
    } catch(err) {
      console.warn("Gemini regex generation failed, using fallback regex", err.message);
    }

    // Test the generated regex
    let extracted = "Not Found";
    try {
      const testRegex = new RegExp(regexStr, 'i');
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

code = code + '\n' + selectionApi;
fs.writeFileSync(path, code);
console.log("Patched billTemplateController.js with updateTemplate version bump and generateRegexFromSelection!");
