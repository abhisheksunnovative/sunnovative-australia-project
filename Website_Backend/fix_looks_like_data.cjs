const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const newLooksLikeData = `const looksLikeData = (word) => {
        if (word.includes('\\uFFFD')) return true; // Skip corrupted PDF characters
        return /^\\$?([0-9,]+(\\.[0-9]+)?|[0-9]{1,4}[-\\/][0-9]{1,2}[-\\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word) ||
               /^[^a-zA-Z0-9]+$/.test(word); // Skip anything that is pure symbols/punctuation
    };`;

const hardCodeReplace = code.split('const looksLikeData = (word) => {');
if (hardCodeReplace.length === 2) {
    const endOfFunction = hardCodeReplace[1].indexOf('};') + 2;
    code = hardCodeReplace[0] + newLooksLikeData + hardCodeReplace[1].substring(endOfFunction);
}

const oldCaptureGroup = `} else if (fieldName === 'fullName' || fieldName === 'consumerName') {
      captureGroup = "([A-Za-z\\\\s\\\\.\\\\'-]{2,50})"; // Greedy name characters only
    }`;

const newCaptureGroup = `} else if (fieldName === 'fullName' || fieldName === 'consumerName') {
      captureGroup = "([A-Za-z\\\\s\\\\.\\\\'-]{2,50})"; // Greedy name characters only
    } else if (fieldName === 'state') {
      captureGroup = "([A-Za-z]{2,5})"; // e.g. NSW, WA, VIC
    }`;

code = code.replace(oldCaptureGroup, newCaptureGroup);

fs.writeFileSync(path, code);
console.log("Fixed looksLikeData and added state capture group.");
