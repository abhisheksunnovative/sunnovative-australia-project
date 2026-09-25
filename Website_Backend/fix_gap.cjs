const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const regexToReplace = /\/\/ 1\. Get BEFORE Context[\s\S]*?const anchorAfter = stableAfterWords\.map\(escapeRegex\)\.join\('\[\\\\s\\\\n\]\+'\);/;

const newLogic = `// Helper to transform gap text into a safe regex gap
    const buildGapRegex = (gapText) => {
        if (!gapText || gapText.trim() === '') return "[\\\\s\\\\n:$,\\\\-]{0,50}?";
        
        let gapRegex = "";
        // Split by whitespace but keep the whitespace tokens
        const tokens = gapText.split(/([\\s\\n\\r]+)/);
        for (const token of tokens) {
            if (/^[\\s\\n\\r]+$/.test(token)) {
                gapRegex += "[\\\\s\\\\n]+";
            } else if (looksLikeData(token)) {
                // If it's a number/data, replace with a generic data matcher
                if (/^[0-9.,]+$/.test(token) || /^\\$?[0-9.,]+$/.test(token)) {
                    gapRegex += "\\\\$?[0-9.,]+";
                } else if (/[a-zA-Z]/.test(token) && /[0-9]/.test(token)) {
                    gapRegex += "[A-Za-z0-9\\\\/-]+";
                } else {
                    gapRegex += "[\\\\s\\\\S]{1," + (token.length + 5) + "}?";
                }
            } else {
                // If it's a symbol or something else
                gapRegex += escapeRegex(token);
            }
        }
        return gapRegex;
    };

    // 1. Get BEFORE Context (Up to 150 chars)
    const precedingText = rawText.substring(Math.max(0, index - 150), index);
    const beforeWordsRaw = precedingText.split(/[\\s\\n\\r]+/).filter(w => w.length > 0);
    const candidateBefore = beforeWordsRaw.reverse(); 
    
    const stableBeforeWords = [];
    let skippedDataBefore = false;
    let anchorBeforeEndIndexRaw = -1;

    for (let i = 0; i < candidateBefore.length; i++) {
        const w = candidateBefore[i];
        if (looksLikeData(w)) {
            if (stableBeforeWords.length > 0) break;
            skippedDataBefore = true;
            continue;
        }
        stableBeforeWords.push(w);
        if (stableBeforeWords.length === 1) {
             // Record where the stable anchor ended in the original text (working backwards)
             // We need to find this word's position in precedingText
             anchorBeforeEndIndexRaw = precedingText.lastIndexOf(w) + w.length;
        }
        if (stableBeforeWords.length >= 3) break;
    }
    stableBeforeWords.reverse();
    const anchorBefore = stableBeforeWords.map(escapeRegex).join('[\\\\s\\\\n]+');
    
    let gapBeforeRegex = "[\\\\s\\\\n:$,\\\\-]{0,50}?";
    if (skippedDataBefore && anchorBeforeEndIndexRaw !== -1) {
         const gapText = precedingText.substring(anchorBeforeEndIndexRaw);
         gapBeforeRegex = buildGapRegex(gapText);
    }

    // 2. Get AFTER Context (Up to 80 chars)
    const afterText = rawText.substring(index + selectedText.length, index + selectedText.length + 80);
    const afterWordsRaw = afterText.split(/[\\s\\n\\r]+/).filter(w => w.length > 0);
    
    const stableAfterWords = [];
    let skippedDataAfter = false;
    let anchorAfterStartIndexRaw = -1;

    for (let i = 0; i < afterWordsRaw.length; i++) {
        const w = afterWordsRaw[i];
        if (looksLikeData(w)) {
            if (stableAfterWords.length > 0) break;
            skippedDataAfter = true;
            continue;
        }
        if (stableAfterWords.length === 0) {
            anchorAfterStartIndexRaw = afterText.indexOf(w);
        }
        stableAfterWords.push(w);
        if (stableAfterWords.length >= 3) break;
    }
    const anchorAfter = stableAfterWords.map(escapeRegex).join('[\\\\s\\\\n]+');
    
    // We already use [\\s\\S]{0,150}? for the after gap in step 4, which naturally skips data.
    // So we don't strictly need a strict gapAfterRegex, but we leave the logic available.`;

code = code.replace(regexToReplace, newLogic);

// Also need to update Step 4 to use gapBeforeRegex!
const step4ToReplace = /let regexStr = "";\s*if \(anchorBefore && anchorAfter\) \{\s*\/\/ Use strict spaces.*\s*\/\/ but use loose.*\s*regexStr = "\(\?:" \+ anchorBefore \+ "\)\[\\\\s\\\\n:\$,\\\\-\]\{0,50\}\?" \+ captureGroup \+ "\(\?=\[\\\\s\\\\S\]\{0,150\}\?" \+ anchorAfter \+ "\)";\s*\} else if \(anchorBefore\) \{\s*regexStr = "\(\?:" \+ anchorBefore \+ "\)\[\\\\s\\\\n:\$,\\\\-\]\{0,50\}\?" \+ captureGroup;\s*\}/;

const newStep4 = `let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")" + gapBeforeRegex + captureGroup + "(?=[\\\\s\\\\S]{0,150}?" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")" + gapBeforeRegex + captureGroup;
    }`;

code = code.replace(step4ToReplace, newStep4);

fs.writeFileSync(path, code);
console.log("Updated gap logic to dynamically build regex for skipped data.");
