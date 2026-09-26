const fs = require('fs');

function patchFile(file) {
    let code = fs.readFileSync(file, 'utf8');

    const regex = /const columnCandidates = wordsWithPositions\.filter\(w =>\s*Math\.abs\(w\.x - headingWord\.x\) < 80 &&\s*w\.y > headingWord\.y \+ 5.*?\)\.sort\(\(a, b\) => a\.y - b\.y\);/s;

    const newCode = `const columnCandidates = wordsWithPositions.filter(w =>
                    Math.abs(w.x - headingWord.x) < 80 &&
                    w.y > headingWord.y + 5 // Below the heading
                ).sort((a, b) => {
                    // If on the same line (within 5px Y), pick the one most perfectly aligned vertically with heading X
                    if (Math.abs(a.y - b.y) < 5) {
                        return Math.abs(a.x - headingWord.x) - Math.abs(b.x - headingWord.x);
                    }
                    return a.y - b.y;
                });`;

    code = code.replace(regex, newCode);
    fs.writeFileSync(file, code);
    console.log("Patched", file);
}

patchFile('d:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js');
patchFile('d:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js');
