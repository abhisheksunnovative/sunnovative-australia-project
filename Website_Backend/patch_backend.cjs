const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newIndexLogic = `
    let index = -1;
    let mainData = override?.mainData ?? selectedText;
    const { selectionIndex } = req.body;
    
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        index = selectionIndex;
    } else {
        index = rawText.indexOf(mainData);
    }

    // Flexible space matching if exact index not found
    if (index === -1 && mainData) {
        const flexibleSelectedText = mainData.trim().split(/[\\s\\n\\r]+/).map(w => w.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&')).join('[\\\\s\\\\n\\\\r]+');
        const match = rawText.match(new RegExp(flexibleSelectedText, 'i'));
        if (match) {
            index = match.index;
            mainData = match[0]; // Update mainData to the actual text in rawText to preserve original spacing
        }
    }

    if (index === -1 && !override) {
      return res.status(400).json({ success: false, message: 'Selected text not found in raw bill text.' });
    }
`.split('\n');

// We need to replace the current index logic block
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let index = -1;')) {
        start = i;
    }
    if (start !== -1 && i > start && lines[i].includes("return res.status(400).json({ success: false, message: 'Selected text not found in raw bill text.' });")) {
        end = i + 1; // Include the closing brace of the if statement
        break;
    }
}

console.log("Start Backend Patch:", start, "End Backend Patch:", end);

if (start !== -1 && end !== -1) {
    const newFileLines = [...lines.slice(0, start), ...newIndexLogic, ...lines.slice(end + 1)];
    fs.writeFileSync(file, newFileLines.join('\n'));
    console.log("Successfully patched flexible index logic in backend");
} else {
    console.log("Could not find boundaries.");
}
