const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const regexGeneratorFunc = `// 5. Generate Regex from Highlighted Text (100% Offline, Before & After Anchor Logic)
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

    // Escape regex characters safely
    const escapeRegex = (str) => {
       let escaped = "";
       for (let i = 0; i < str.length; i++) {
          if ("-\\\\/^$*+?.()|[]{}".includes(str[i])) {
             escaped += "\\\\" + str[i];
          } else {
             escaped += str[i];
          }
       }
       return escaped;
    };

    // 1. Get BEFORE Context (Up to 80 chars)
    const precedingText = rawText.substring(Math.max(0, index - 80), index);
    const beforeLines = precedingText.split(/[\\n\\r]+/);
    let targetBeforeText = beforeLines[beforeLines.length - 1].trim();
    if (targetBeforeText.length < 5 && beforeLines.length > 1) {
       targetBeforeText = beforeLines[beforeLines.length - 2].trim() + " " + targetBeforeText;
    }
    const beforeWords = targetBeforeText.split(/[\\s]+/).filter(w => w.length > 0);
    const anchorBeforeWords = beforeWords.slice(Math.max(0, beforeWords.length - 3));
    const anchorBefore = anchorBeforeWords.map(escapeRegex).join('[\\\\s\\\\n]+');

    // 2. Get AFTER Context (Up to 40 chars)
    const afterText = rawText.substring(index + selectedText.length, index + selectedText.length + 40);
    const afterLines = afterText.split(/[\\n\\r]+/);
    let targetAfterText = afterLines[0].trim();
    if (targetAfterText.length < 3 && afterLines.length > 1) {
       targetAfterText += " " + afterLines[1].trim();
    }
    const afterWords = targetAfterText.split(/[\\s]+/).filter(w => w.length > 0);
    const anchorAfterWords = afterWords.slice(0, 3);
    const anchorAfter = anchorAfterWords.map(escapeRegex).join('[\\\\s\\\\n]+');

    // 3. Define the Capture Group Type
    let captureGroup = "([A-Za-z0-9\\\\s.&-]{2,50})"; // Generic string
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
    }

    // 4. Build the Regex with Before and After constraints!
    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:]{0,20}?" + captureGroup + "(?=[\\\\s\\\\n]*" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:]{0,20}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\\d+/g, '\\\\d+');
    }

    // 5. Test it
    let extracted = "Not Found";
    try {
      const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
      const testRegex = new RegExp(regexStr, isStrictCase ? '' : 'i');
      const match = rawText.match(testRegex);
      if (match) {
         // Fix JS bug: if match[1] is undefined, do not fallback to match[0] if match[1] was empty string
         if (match[1] !== undefined) {
             extracted = match[1].trim();
         } else {
             extracted = match[0].trim();
         }
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
console.log("Replaced with Before/After Anchoring Logic!");
