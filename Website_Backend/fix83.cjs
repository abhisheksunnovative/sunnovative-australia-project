const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const regexGeneratorFunc = `// 5. Generate Regex from Highlighted Text (100% Offline, No Gemini API)
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
    
    // Attempt to find a meaningful label/anchor in the preceding text (like "Total", "Amount", "Account", etc)
    const contextWords = precedingText.split(/[\\n\\r]+/).pop().trim().split(/\\s+/);
    let anchor = '';
    
    // Pick the last 1 or 2 words on the same line as anchor
    if (contextWords.length >= 2) {
       anchor = contextWords.slice(-2).join('\\\\s+');
    } else if (contextWords.length === 1) {
       anchor = contextWords[0];
    }
    
    // Escape the anchor
    anchor = anchor.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');

    // Build the specific capture group based on the field type
    let captureGroup = "(.*?)"; // default fallback
    
    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
      captureGroup = "([0-9,]+(?:\\\\.[0-9]+)?)";
    } else if (fieldName === 'dueDate' || fieldName === 'billIssuedDate') {
      // Date pattern could be dd/mm/yyyy or dd MMM yyyy
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

    // Combine anchor with the capture group, allowing for flexible gaps
    let regexStr = "";
    if (anchor) {
      // (?:Anchor) followed by gap of 0 to 100 chars, then the capture group
      regexStr = "(?:" + anchor + ")[\\\\s\\\\S]{0,100}?" + captureGroup;
    } else {
       // If no anchor found, just try to match the exact selection format
       regexStr = selectedText.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&').replace(/\\d+/g, '\\\\d+');
    }

    // Force strict boundaries for numbers
    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
       regexStr += "(?=\\\\s|\\n|$)";
    }

    // Test the generated regex
    let extracted = "Not Found";
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
};`;

// Replace the entire old function
code = code.replace(/\/\/ 5\. Generate Regex from Highlighted Text[\s\S]*?(?=\n$|$)/, regexGeneratorFunc);

fs.writeFileSync(path, code);
console.log("Replaced generateRegexFromSelection with 100% Offline Logic!");
