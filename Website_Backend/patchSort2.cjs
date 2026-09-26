const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');

    // Replace the specific columnCandidates block in billTemplateController
    const oldBlock1 = `const columnCandidates = wordsWithPositions.filter(w => {
                    const xDiff = Math.abs(w.x - headingWord.x);
                    const yDiff = w.y - headingWord.y;
                    return xDiff < 80 && yDiff > 5;
                }).sort((a, b) => a.y - b.y);`;
                
    const newBlock1 = `const columnCandidates = wordsWithPositions.filter(w => {
                    const xDiff = Math.abs(w.x - headingWord.x);
                    const yDiff = w.y - headingWord.y;
                    return xDiff < 80 && yDiff > 5;
                }).sort((a, b) => {
                    if (Math.abs(a.y - b.y) < 5) {
                        return Math.abs(a.x - headingWord.x) - Math.abs(b.x - headingWord.x);
                    }
                    return a.y - b.y;
                });`;

    if (code.includes(oldBlock1)) {
        code = code.replace(oldBlock1, newBlock1);
        console.log("Patched full block in", file);
    }
    
    // Replace the old log string
    const oldLog = `console.log(\`Filtering words below Y > \${Math.round(headingWord.y + 5)} and within X ±40 of \${Math.round(headingWord.x)}...\`);`;
    const newLog = `console.log(\`Filtering words below Y > \${Math.round(headingWord.y + 5)} and within X ±80 of \${Math.round(headingWord.x)}...\`);`;
    if (code.includes(oldLog)) {
        code = code.replace(oldLog, newLog);
    }
    
    // For templateExtractor.js it might be different
    const oldBlock2 = `const columnCandidates = wordsWithPositions.filter(w =>
                            Math.abs(w.x - headingWord.x) < 80 &&
                            w.y > headingWord.y + 5
                        ).sort((a, b) => a.y - b.y);`;
    const newBlock2 = `const columnCandidates = wordsWithPositions.filter(w =>
                            Math.abs(w.x - headingWord.x) < 80 &&
                            w.y > headingWord.y + 5
                        ).sort((a, b) => {
                            if (Math.abs(a.y - b.y) < 5) {
                                return Math.abs(a.x - headingWord.x) - Math.abs(b.x - headingWord.x);
                            }
                            return a.y - b.y;
                        });`;
    if (code.includes(oldBlock2)) {
        code = code.replace(oldBlock2, newBlock2);
        console.log("Patched simplified block in", file);
    }

    fs.writeFileSync(file, code);
}

patchFile('d:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js');
patchFile('d:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js');
