const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const target = `    let selectionIndex = -1;
    if (sel.anchorNode && sel.anchorNode.textContent === rawTextPreview) {
        selectionIndex = Math.min(sel.anchorOffset, sel.focusOffset);
    }`;

const replacement = `    let selectionIndex = -1;
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

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log("Fixed selectionIndex calculation in frontend.");
