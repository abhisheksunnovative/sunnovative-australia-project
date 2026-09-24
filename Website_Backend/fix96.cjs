const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// We will replace the entire generateRegexFromSelection function again to implement Smart Anchors!
const regexGeneratorFunc = `// 5. Generate Regex from Highlighted Text (100% Offline, Smart Anchor Logic)
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

    // Smart anchor logic to skip data-like words (numbers, dates, months)
    const looksLikeData = (word) => {
        return /^\\$?([0-9,]+(\\.[0-9]+)?|[0-9]{1,4}[-\\/][0-9]{1,2}[-\\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word);
    };

    // 1. Get BEFORE Context (Up to 150 chars)
    const precedingText = rawText.substring(Math.max(0, index - 150), index);
    const beforeWordsRaw = precedingText.split(/[\\s\\n\\r]+/).filter(w => w.length > 0);
    const candidateBefore = beforeWordsRaw.reverse(); // traverse backwards
    
    const stableBeforeWords = [];
    let skippedData = false;
    for (const w of candidateBefore) {
        if (looksLikeData(w)) {
            if (stableBeforeWords.length > 0) break; // Already found real words, stop traversing back
            skippedData = true;
            continue; // Skip data words
        }
        stableBeforeWords.push(w);
        if (stableBeforeWords.length >= 3) break; // We have enough strong anchor words
    }
    stableBeforeWords.reverse(); // Restore normal order
    const anchorBefore = stableBeforeWords.map(escapeRegex).join('[\\\\s\\\\n]+');

    // 2. Get AFTER Context (Up to 80 chars)
    const afterText = rawText.substring(index + selectedText.length, index + selectedText.length + 80);
    const afterWordsRaw = afterText.split(/[\\s\\n\\r]+/).filter(w => w.length > 0);
    
    const stableAfterWords = [];
    for (const w of afterWordsRaw) {
        if (looksLikeData(w)) {
            if (stableAfterWords.length > 0) break;
            continue;
        }
        stableAfterWords.push(w);
        if (stableAfterWords.length >= 3) break;
    }
    const anchorAfter = stableAfterWords.map(escapeRegex).join('[\\\\s\\\\n]+');

    // 3. Define the Capture Group Type
    let captureGroup = "([^\\\\n\\\\r]{2,80}?)"; // Generic string
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

    // 4. Build the Regex with Before and After constraints
    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:]{0,50}?" + captureGroup + "(?=[\\\\s\\\\n]*" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:]{0,50}?" + captureGroup;
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

code = code.replace(/\/\/ 5\. Generate Regex from Highlighted Text[\s\S]*?(?=\n$|$)/, regexGeneratorFunc);
fs.writeFileSync(path, code);
console.log("Fixed: Smart Anchors logic implemented in regex generation.");
