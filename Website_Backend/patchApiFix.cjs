const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /let previewValue = 'Not Found';\s*try \{\s*const isStrictCase = fieldName === 'fullName' \|\| fieldName === 'consumerName';\s*const match = rawText\.match\(new RegExp\(finalRegex, isStrictCase \? '' : 'i'\)\);\s*if \(match\) \{\s*if \(ruleType === 'split-currency' && match\[1\] && match\[2\]\) \{\s*previewValue = parseFloat\(match\[1\]\.replace\(\/,\/g, ''\) \+ '\.' \+ match\[2\]\)\.toString\(\);\s*\} else \{\s*previewValue = match\[1\] \? match\[1\]\.trim\(\) : match\[0\]\.trim\(\);\s*\}\s*\}\s*\} catch \(e\) \{\s*return res\.status\(400\)\.json\(\{ success: false, message: 'Regex build error: ' \+ e\.message \}\);\s*\}/;

const newPreviewBlock = `let previewValue = 'Not Found';
    try {
        const matchStrategy = override?.matchStrategy || 'inline';
        const heading = override?.heading || '';
        
        if (matchStrategy === 'column-below' && wordsWithPositions && heading) {
            const headingWords = heading.split(/[\\s\\n]+/).filter(w => w.trim());
            let headingWord = null;
            if (headingWords.length > 0) {
                const targetWord = headingWords[headingWords.length - 1]; // Use last word of heading
                // Find nearest word containing targetWord
                const possibleHeadings = wordsWithPositions.filter(w => w.text.toLowerCase().includes(targetWord.toLowerCase()));
                if (possibleHeadings.length > 0) {
                    headingWord = possibleHeadings[0]; // just take first for now
                }
            }
            
            if (headingWord) {
                const columnCandidates = wordsWithPositions.filter(w =>
                    Math.abs(w.x - headingWord.x) < 40 &&
                    w.y > headingWord.y + 5 // Below the heading
                ).sort((a, b) => a.y - b.y);
                
                if (columnCandidates.length > 0) {
                    previewValue = columnCandidates[0].text;
                    if (ruleType === 'number') {
                        const numMatch = previewValue.match(/[0-9,\\.]+/);
                        if (numMatch) previewValue = numMatch[0];
                    }
                }
            }
        }

        if (previewValue === 'Not Found') {
            const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
            const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));
            if (match) {
                if (ruleType === 'split-currency' && match[1] && match[2]) {
                    previewValue = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();
                } else {
                    previewValue = match[1] ? match[1].trim() : match[0].trim();
                }
            }
        }
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Regex build error: ' + e.message });
    }`;

code = code.replace(regex, newPreviewBlock);
fs.writeFileSync(file, code);
console.log("Updated API preview logic using regex!");
