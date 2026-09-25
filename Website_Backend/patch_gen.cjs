const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const generateRegexFromSelection = async (req, res) => {')) {
        startIndex = i;
    }
    if (startIndex !== -1 && i > startIndex && lines[i].includes('};') && lines[i-2] && lines[i-2].includes('res.status(500).json')) {
        endIndex = i;
        break;
    }
}

console.log("Start:", startIndex, "End:", endIndex);

const newCode = `export const generateRegexFromSelection = async (req, res) => {
  try {
    const { rawText, selectedText, fieldName, override } = req.body;
    if (!rawText || (!selectedText && !override?.mainData)) {
      return res.status(400).json({ success: false, message: 'Missing rawText or selectedText' });
    }

    let index = -1;
    const { selectionIndex } = req.body;
    
    // Determine exact index logic
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        index = selectionIndex;
    } else {
        index = rawText.indexOf(selectedText);
    }

    const mainData = override?.mainData ?? selectedText;

    if (index === -1 && !override) {
      return res.status(400).json({ success: false, message: 'Selected text not found in raw bill text.' });
    }

    // Helper: Escape Regex but keep spaces simple
    const escapeRegex = (str) => {
        let o = '';
        for (const c of str) {
            o += '.*+?^$\\{}()|[]\\\\'.includes(c) ? '\\\\' + c : c;
        }
        return o;
    };

    const flexible = (str) => escapeRegex(str.trim()).replace(/\\s+/g, '[\\\\s\\\\n]+');

    // Helper: Looks like data
    const looksLikeData = (word) => {
        if (/^[0-9.,\\-$]+$/.test(word)) return true;
        if (/^[0-9]{2}[\\/\\-][0-9]{2}[\\/\\-][0-9]{2,4}$/.test(word)) return true;
        if (/^[0-9]{1,2}[a-zA-Z]{3}[0-9]{2,4}$/.test(word)) return true;
        return false;
    };

    // Find Stable Anchor Helper
    const findStableAnchor = (textStr, direction) => {
        const wordsRaw = textStr.split(/[\\s\\n\\r]+/).filter(w => w.length > 0);
        let candidateWords = direction === 'before' ? wordsRaw.reverse() : wordsRaw;
        
        const stableWords = [];
        for (let i = 0; i < candidateWords.length; i++) {
            const w = candidateWords[i];
            if (looksLikeData(w)) {
                if (stableWords.length > 0) break;
                continue;
            }
            stableWords.push(w);
            if (stableWords.length >= 3) break;
        }
        
        if (direction === 'before') stableWords.reverse();
        return stableWords.join(' ');
    };

    // CORE LOGIC
    let heading, trailing;

    if (override?.heading !== undefined) {
        heading = override.heading;
    } else {
        const precedingText = rawText.substring(Math.max(0, index - 150), index);
        heading = findStableAnchor(precedingText, 'before');
    }

    if (override?.trailing !== undefined) {
        trailing = override.trailing;
    } else {
        const afterText = rawText.substring(index + mainData.length, index + mainData.length + 80);
        trailing = findStableAnchor(afterText, 'after');
    }

    // Type-specific capture group
    const captureGroups = {
        monthlyBill:   '([0-9,]+(?:\\\\.[0-9]+)?)',
        quarterlyKwh:  '([0-9,]+(?:\\\\.[0-9]+)?)',
        dueDate:       '([0-9]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+[0-9]{2,4})',
        billIssuedDate:'([0-9]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+[0-9]{2,4}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})',
        default:       '([^\\\\n\\\\r]{2,80}?)'
    };
    
    // Map to fieldName provided from frontend
    const mappedType = ['monthlyBill', 'quarterlyKwh', 'dueDate', 'billIssuedDate'].includes(fieldName) ? fieldName : 'default';
    let captureGroup = captureGroups[mappedType];
    
    if (fieldName === 'consumerNumber' || fieldName === 'consumerBillNumber') {
      captureGroup = '([A-Za-z0-9\\\\- ]{3,25})';
    } else if (fieldName === 'fullName' || fieldName === 'consumerName') {
      captureGroup = '([A-Za-z\\\\s\\\\.\\\\'-]{2,50})';
    } else if (fieldName === 'state') {
      captureGroup = '([A-Za-z]{2,5})';
    }

    // Build the Regex Parts
    let parts = [];
    if (heading && heading.trim())  {
        parts.push(\`(?:(?:\${flexible(heading)})[\\\\s\\\\S]{0,150}?)\`);
    }
    parts.push(captureGroup);
    if (trailing && trailing.trim()) {
        parts.push(\`(?=[\\\\s\\\\S]{0,50}?\${flexible(trailing)})\`);
    }

    let finalRegex = parts.join('');
    if (!heading?.trim() && !trailing?.trim()) {
        finalRegex = escapeRegex(mainData).replace(/\\d+/g, '\\\\d+');
    }

    let previewValue = 'Not Found';
    try {
        const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));
        if (match) previewValue = match[1] ? match[1].trim() : match[0].trim();
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Regex build error: ' + e.message });
    }

    const warning = (!heading?.trim() && !trailing?.trim())
        ? 'Koi heading/trailing nahi mila — ye field galat data bhi pakad sakti hai kisi doosre bill pe.'
        : null;

    res.json({ success: true, data: { regex: finalRegex, previewValue }, heading, mainData, trailing, warning });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};`.split('\n');

if (startIndex !== -1 && endIndex !== -1) {
    const newLines = [...lines.slice(0, startIndex), ...newCode, ...lines.slice(endIndex + 1)];
    fs.writeFileSync(file, newLines.join('\n'));
    console.log("Successfully replaced generateRegexFromSelection");
} else {
    console.log("Could not find start or end index");
}
