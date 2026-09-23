const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let code = fs.readFileSync(path, 'utf8');

code = code.split('[\\\\s\\\\S]{0,30}?').join('[\\\\s\\\\S]{0,150}?');
code = code.split('[\\\\s\\\\S]{0,40}?').join('[\\\\s\\\\S]{0,200}?');
code = code.split('[\\\\s\\\\S]{0,80}?').join('[\\\\s\\\\S]{0,200}?');

fs.writeFileSync(path, code);
console.log("Successfully replaced gap limits using string split/join!");
