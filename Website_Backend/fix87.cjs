const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const regexGeneratorFunc = `// 5. Generate Regex from Highlighted Text (100% Offline, Pure Math)
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
    const precedingText = rawText.substring(Math.max(0, index - 80), index);
    
    // Algorithm: Get the text on the SAME line just before the value
    const lines = precedingText.split(/[\\n\\r]+/);
    const lastLine = lines[lines.length - 1].trim();
    
    // Pick the last 2-3 words from this line to form a very strong anchor (e.g., "This bill:" or "Total Due:")
    const words = lastLine.split(/[\\s]+/);
    // Take up to 3 words
    const anchorWords = words.slice(Math.max(0, words.length - 3)).filter(w => w.length > 0);
    
    // Escape regex characters
    const escapeRegex = (str) => str.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
    
    let anchor = anchorWords.map(escapeRegex).join('\\\\s*'); // connect with flexible spaces

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
      // (?:Anchor) followed by a short gap
      regexStr = "(?:" + anchor + ")[\\\\s:]{0,20}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\\\\d+/g, '\\\\d+');
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

// Replace the entire old function
code = code.replace(/\/\/ 5\. Generate Regex from Highlighted Text[\s\S]*?(?=\n$|$)/, regexGeneratorFunc);

fs.writeFileSync(path, code);
console.log("Replaced with 100% Offline Line-based Anchor Logic!");
