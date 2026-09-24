const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const regexBlock = /    let regexStr = "";\n    if \(anchorBefore && anchorAfter\) \{\n      regexStr = "\(\?:" \+ anchorBefore \+ "\)\[\\\\s\\\\n:\$,\\\\-\]\{0,50\}\?" \+ captureGroup \+ "\(\?=\[\\\\s\\\\n:\$,\\\\-\]\{0,50\}\?" \+ anchorAfter \+ "\)";/;

const newRegexBlock = `    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      // Use strict spaces before the capture group to prevent greedy matching,
      // but use loose [\\s\\S] in the lookahead to allow skipping over other data numbers
      regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:$,\\\\-]{0,50}?" + captureGroup + "(?=[\\\\s\\\\S]{0,150}?" + anchorAfter + ")";`;

code = code.replace(regexBlock, newRegexBlock);
fs.writeFileSync(path, code);
console.log("Fixed lookahead regex to be loose.");
