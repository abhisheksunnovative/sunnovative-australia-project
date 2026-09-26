const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /let previewValue = 'Not Found';\s*try \{\s*const matchStrategy = override\?\.matchStrategy \|\| 'inline';\s*const heading = override\?\.heading \|\| '';\s*if \(matchStrategy === 'column-below' && wordsWithPositions && heading\) \{([\s\S]*?)\}\s*if \(previewValue === 'Not Found'\) \{/;

const newPreviewBlock = `let previewValue = 'Not Found';
    try {
        const matchStrategy = override?.matchStrategy || 'inline';
        const heading = override?.heading || '';
        
        console.log(\`\\n=== [Column-Below Debug] ===\`);
        console.log(\`Field Name: \${fieldName}\`);
        console.log(\`Match Strategy: \${matchStrategy}\`);
        console.log(\`Heading Provided: \${heading}\`);
        console.log(\`Has wordsWithPositions: \${!!wordsWithPositions} (\${wordsWithPositions ? wordsWithPositions.length : 0} items)\`);
        
        if (matchStrategy === 'column-below' && wordsWithPositions && heading) {
            const headingWords = heading.split(/[\\s\\n]+/).filter(w => w.trim());
            let headingWord = null;
            if (headingWords.length > 0) {
                const targetWord = headingWords[headingWords.length - 1]; // Use last word of heading
                console.log(\`Looking for heading word containing: "\${targetWord}"\`);
                
                // Find nearest word containing targetWord
                const possibleHeadings = wordsWithPositions.filter(w => w.text.toLowerCase().includes(targetWord.toLowerCase()));
                console.log(\`Found \${possibleHeadings.length} matching heading candidates:\`, possibleHeadings.map(h => \`"\${h.text}" (X:\${Math.round(h.x)}, Y:\${Math.round(h.y)})\`));
                
                if (possibleHeadings.length > 0) {
                    headingWord = possibleHeadings[0]; // just take first for now
                    console.log(\`Selected anchor heading: "\${headingWord.text}" at X:\${Math.round(headingWord.x)}, Y:\${Math.round(headingWord.y)}\`);
                }
            }
            
            if (headingWord) {
                console.log(\`Filtering words below Y > \${Math.round(headingWord.y + 5)} and within X ±40 of \${Math.round(headingWord.x)}...\`);
                const columnCandidates = wordsWithPositions.filter(w => {
                    const xDiff = Math.abs(w.x - headingWord.x);
                    const yDiff = w.y - headingWord.y;
                    return xDiff < 40 && yDiff > 5;
                }).sort((a, b) => a.y - b.y);
                
                console.log(\`Found \${columnCandidates.length} candidates in the column below:\`);
                columnCandidates.slice(0, 5).forEach((c, i) => {
                    console.log(\`  [\${i+1}] "\${c.text}" (X:\${Math.round(c.x)}, Y:\${Math.round(c.y)})\`);
                });
                
                if (columnCandidates.length > 0) {
                    previewValue = columnCandidates[0].text;
                    console.log(\`Raw previewValue picked: "\${previewValue}"\`);
                    if (ruleType === 'number') {
                        const numMatch = previewValue.match(/[0-9,\\.]+/);
                        if (numMatch) {
                            previewValue = numMatch[0];
                            console.log(\`Extracted number: "\${previewValue}"\`);
                        }
                    }
                } else {
                    console.log(\`No words found below the heading within limits.\`);
                }
            } else {
                console.log(\`Could not find heading anchor in words array.\`);
            }
        } else {
            if (matchStrategy !== 'column-below') console.log(\`Skipping column-below because strategy is \${matchStrategy}\`);
            else if (!wordsWithPositions) console.log(\`Skipping column-below because wordsWithPositions is MISSING!\`);
            else console.log(\`Skipping column-below because heading is missing.\`);
        }
        console.log(\`=== [End Debug] ===\\n\`);

        if (previewValue === 'Not Found') {`;

code = code.replace(regex, newPreviewBlock);
fs.writeFileSync(file, code);
console.log("Added logs to backend!");
