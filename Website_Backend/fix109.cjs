const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Update looksLikeData to skip standalone currency symbols like $
const oldLooksLikeData = `    const looksLikeData = (word) => {
        return /^\\$?([0-9,]+(\\.[0-9]+)?|[0-9]{1,4}[-\\/][0-9]{1,2}[-\\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word);
    };`;

const newLooksLikeData = `    const looksLikeData = (word) => {
        return /^\\$?([0-9,]+(\\.[0-9]+)?|[0-9]{1,4}[-\\/][0-9]{1,2}[-\\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word) ||
               /^[$£€₹:,-]+$/.test(word); // Skip isolated symbols and punctuation
    };`;

code = code.replace(oldLooksLikeData, newLooksLikeData);

fs.writeFileSync(path, code);
console.log("Updated looksLikeData to skip isolated symbols.");
