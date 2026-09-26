const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /const xDiff = Math\.abs\(w\.x - headingWord\.x\);\s*const yDiff = w\.y - headingWord\.y;\s*return xDiff < 40 && yDiff > 5;/;
const newCode = `const xDiff = Math.abs(w.x - headingWord.x);
                    const yDiff = w.y - headingWord.y;
                    return xDiff < 80 && yDiff > 5;`;
code = code.replace(regex, newCode);

const regex2 = /Math\.abs\(w\.x - headingWord\.x\) < 40/g;
code = code.replace(regex2, `Math.abs(w.x - headingWord.x) < 80`);

fs.writeFileSync(file, code);
console.log("Widened X tolerance to 80");
