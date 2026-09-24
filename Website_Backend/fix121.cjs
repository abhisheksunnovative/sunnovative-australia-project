const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const oldIndexOf = `    const { rawText, selectedText, fieldName } = req.body;
    
    // 1. Find EXACT index of selection
    const startIndex = rawText.indexOf(selectedText);`;

const newIndexOf = `    const { rawText, selectedText, fieldName, selectionIndex } = req.body;
    
    // 1. Find EXACT index of selection (use browser's selectionIndex if provided and valid, else fallback to indexOf)
    let startIndex = -1;
    if (selectionIndex !== undefined && selectionIndex >= 0 && rawText.substring(selectionIndex, selectionIndex + selectedText.length) === selectedText) {
        startIndex = selectionIndex;
    } else {
        startIndex = rawText.indexOf(selectedText);
    }`;

code = code.replace(oldIndexOf, newIndexOf);
fs.writeFileSync(path, code);
console.log("Updated generateRegexFromSelection to use selectionIndex.");
