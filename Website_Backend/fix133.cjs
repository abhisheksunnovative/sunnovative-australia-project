const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const oldIndexLogic = `    const index = rawText.indexOf(selectedText);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Selected text not found in the bill.' });
    }`;

const newIndexLogic = `    let index = -1;
    const { selectionIndex } = req.body;
    console.log(\`[Backend] 📍 Received selectionIndex: \${selectionIndex}\`);
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        const searchWindowStart = Math.max(0, selectionIndex - 500);
        const searchWindowEnd = Math.min(rawText.length, selectionIndex + selectedText.length + 500);
        const windowText = rawText.substring(searchWindowStart, searchWindowEnd);
        const windowMatchIndex = windowText.indexOf(selectedText);
        if (windowMatchIndex !== -1) {
            index = searchWindowStart + windowMatchIndex;
        } else {
            index = rawText.indexOf(selectedText);
        }
    } else {
        index = rawText.indexOf(selectedText);
    }
    console.log(\`[Backend] 🎯 Final index used: \${index}\`);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Selected text not found in the bill.' });
    }`;

// Wait, I already injected startIndex earlier. Let's clean up the whole file to be safe.
code = code.replace(oldIndexLogic, newIndexLogic);

// Remove the old injected startIndex block
const oldInjectedBlock = /    console\.log\(`\[Backend\] 📍 Received selectionIndex: \$\{selectionIndex\}`\);\n    let startIndex = -1;\n    if \(selectionIndex \!== undefined && selectionIndex >= 0\) \{\n        \/\/ Create a 1000-character search window.*\n.*\n.*\n.*\n        \n        const windowMatchIndex = windowText\.indexOf\(selectedText\);\n        if \(windowMatchIndex \!== -1\) \{\n            \/\/ Found it exactly where the user clicked.*\n            startIndex = searchWindowStart \+ windowMatchIndex;\n        \} else \{\n            \/\/ Hard fallback if not found in window\n            startIndex = rawText\.indexOf\(selectedText\);\n        \}\n    \} else \{\n        startIndex = rawText\.indexOf\(selectedText\);\n    \}\n    console\.log\(`\[Backend\] 🎯 Final startIndex used: \$\{startIndex\}`\);\n    let traverseBefore = rawText\.substring\(0, startIndex\);/g;

code = code.replace(oldInjectedBlock, "");

fs.writeFileSync(path, code);
console.log("Fixed the index tracking bug properly.");
