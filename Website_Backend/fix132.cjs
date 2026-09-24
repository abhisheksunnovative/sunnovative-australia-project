const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const target = `    console.log(\`[Backend] 📍 Received selectionIndex: \${selectionIndex}\`);
    let startIndex = -1;
    if (selectionIndex !== undefined && selectionIndex >= 0 && rawText.substring(selectionIndex, selectionIndex + selectedText.length) === selectedText) {
        startIndex = selectionIndex;
    } else {
        startIndex = rawText.indexOf(selectedText);
    }`;

const replacement = `    console.log(\`[Backend] 📍 Received selectionIndex: \${selectionIndex}\`);
    let startIndex = -1;
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        // Create a 1000-character search window around the provided selectionIndex
        // This solves any \\r\\n drift or frontend DOM counting issues!
        const searchWindowStart = Math.max(0, selectionIndex - 500);
        const searchWindowEnd = Math.min(rawText.length, selectionIndex + selectedText.length + 500);
        const windowText = rawText.substring(searchWindowStart, searchWindowEnd);
        
        const windowMatchIndex = windowText.indexOf(selectedText);
        if (windowMatchIndex !== -1) {
            // Found it exactly where the user clicked (within the window drift)
            startIndex = searchWindowStart + windowMatchIndex;
        } else {
            // Hard fallback if not found in window
            startIndex = rawText.indexOf(selectedText);
        }
    } else {
        startIndex = rawText.indexOf(selectedText);
    }`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log("Updated selectionIndex to use search window.");
