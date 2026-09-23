const fs = require('fs');

const dictPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/RegexDictionary.js';
let dict = fs.readFileSync(dictPath, 'utf8');

const newFields = `
  billNumber: "(?:Invoice\\\\s*(?:No\\\\.?|Number)|Bill\\\\s*(?:No\\\\.?|Number)|Tax\\\\s*Invoice\\\\s*(?:No\\\\.?|Number))\\\\s*[:\\\\-]?\\\\s*([A-Za-z0-9\\\\-]+)",
  billIssueDate: "(?:Issue\\\\s*Date|Date\\\\s*of\\\\s*Issue|Invoice\\\\s*Date|Bill\\\\s*Date|Statement\\\\s*Date)\\\\s*[:\\\\-]?\\\\s*([\\\\d]{1,2}\\\\s+[A-Za-z]{3,9}\\\\s+\\\\d{2,4}|[\\\\d]{1,2}[-/][\\\\d]{1,2}[-/][\\\\d]{2,4})",
`;

dict = dict.replace('dueDate: ', newFields + '  dueDate: ');
fs.writeFileSync(dictPath, dict);
console.log('RegexDictionary updated');
