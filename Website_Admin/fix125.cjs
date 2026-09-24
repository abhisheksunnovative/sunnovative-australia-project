const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const oldSelectionLogic = `    let selectionIndex = -1;
    if (sel.anchorNode) {
        // Find the index of the selected text within the entire rawTextPreview
        // by counting the text length of all preceding nodes in the pre element
        const preElement = sel.anchorNode.parentElement.closest('pre');
        if (preElement) {
            const range = sel.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(preElement);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            selectionIndex = preSelectionRange.toString().length;
        } else {
            // Fallback if not inside pre (shouldn't happen)
            selectionIndex = rawTextPreview.indexOf(selection);
        }
    }`;

const newSelectionLogic = `    let selectionIndex = -1;
    if (sel.anchorNode) {
        const preElement = sel.anchorNode.parentElement ? sel.anchorNode.parentElement.closest('pre') : null;
        if (preElement) {
            const range = sel.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(preElement);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            const domIndex = preSelectionRange.toString().length;
            
            // Find ALL occurrences of the selection in rawTextPreview
            // and pick the one closest to the DOM index to avoid \\r\\n shifting issues
            let bestIndex = -1;
            let minDiff = Infinity;
            let currentIndex = rawTextPreview.indexOf(selection);
            while (currentIndex !== -1) {
                const diff = Math.abs(currentIndex - domIndex);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestIndex = currentIndex;
                }
                currentIndex = rawTextPreview.indexOf(selection, currentIndex + 1);
            }
            selectionIndex = bestIndex !== -1 ? bestIndex : domIndex;
        } else {
            selectionIndex = rawTextPreview.indexOf(selection);
        }
    }`;

code = code.replace(oldSelectionLogic, newSelectionLogic);
fs.writeFileSync(path, code);
console.log("Improved selectionIndex calculation to fix CRLF mismatch.");
