const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const cutoffIndex = code.indexOf('// 5. Generate Regex from Highlighted Text');
if (cutoffIndex !== -1) {
  code = code.substring(0, cutoffIndex);
}

const safeRegexGeneratorFunc = `// 5. Generate Regex from Highlighted Text (100% Offline, No Gemini API)
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
    
    // Attempt to find a meaningful label/anchor in the preceding text
    const contextWords = precedingText.split(/[\\n\\r]+/).pop().trim().split(/\\s+/);
    let anchor = '';
    
    if (contextWords.length >= 2) {
       anchor = contextWords.slice(-2).join('\\\\s+');
    } else if (contextWords.length === 1) {
       anchor = contextWords[0];
    }
    
    // Custom escape function instead of replace with $& to avoid javascript replace bugs
    const escapeRegex = (str) => {
        return str.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
    };
    
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
      regexStr = "(?:" + anchor + ")[\\\\s\\\\S]{0,100}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\\\\d+/g, '\\\\d+');
    }

    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
       regexStr += "(?=\\\\s|\\n|$)";
    }

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
};
`;

// Notice I used a helper function internally to `generateRegexFromSelection` to escape without causing issues for outer replacement.
// But we don't even use string replace on code anymore, we just append.

fs.writeFileSync(path, code + safeRegexGeneratorFunc);
console.log("Fixed the syntax error by appending instead of replacing.");
