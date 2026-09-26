const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');

    // 1. Never generate Trailing. Trailing causes bugs.
    const trailingRegex = /const afterText = rawText\.substring\(index \+ mainData\.length, index \+ mainData\.length \+ 80\);\s*trailing = findStableAnchor\(afterText, 'after'\);/;
    const newTrailing = `trailing = ""; // USER REQUEST: NEVER auto-generate trailing words, we will only use full headings.`;
    code = code.replace(trailingRegex, newTrailing);

    // 2. Grab full heading instead of just 3 words
    const anchorRegex = /stableWords\.push\(w\);\s*if \(stableWords\.length >= 3\) break;/;
    const newAnchor = `stableWords.push(w);
            if (stableWords.length >= 6) break; // Grab up to 6 words for a full heading (e.g. Net Bill Amount 18-19)`;
    code = code.replace(anchorRegex, newAnchor);

    fs.writeFileSync(file, code);
    console.log("Patched auto-generation logic");
}

patchFile('d:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js');
