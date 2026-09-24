const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const target1 = `regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\S]{0,150}?" + captureGroup + "(?=[\\\\s\\\\S]{0,50}?" + anchorAfter + ")";`;
const rep1 = `regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:$£€,-]{0,50}?" + captureGroup + "(?=[\\\\s\\\\n:$£€,-]{0,50}?" + anchorAfter + ")";`;

const target2 = `regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\S]{0,150}?" + captureGroup;`;
const rep2 = `regexStr = "(?:" + anchorBefore + ")[\\\\s\\\\n:$£€,-]{0,50}?" + captureGroup;`;

code = code.replace(target1, rep1);
code = code.replace(target2, rep2);

fs.writeFileSync(path, code);
console.log("Reverted greedy regex to strict space/symbol regex.");
