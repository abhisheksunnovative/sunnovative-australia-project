const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace handleRegenerate payload
const regexRegen = /override: \{\s*heading: rule\.heading,\s*mainData: rule\.mainData,\s*trailing: rule\.trailing\s*\}/;
const newRegen = `wordsWithPositions: wordsWithPositions,
        override: {
            heading: rule.heading,
            mainData: rule.mainData,
            trailing: rule.trailing,
            matchStrategy: rule.matchStrategy
        }`;
code = code.replace(regexRegen, newRegen);

// Replace handleHighlightGenerate payload
const regexHigh = /ruleType: typeToUse,\s*selectionIndex: selectionIndex/;
const newHigh = `ruleType: typeToUse,
        selectionIndex: selectionIndex,
        wordsWithPositions: wordsWithPositions`;
code = code.replace(regexHigh, newHigh);

// Replace scan
const regexScan = /if \(res\.data\.rawText\) setRawTextPreview\(res\.data\.rawText\);\s*alert\("Template Rules automatically generated from sample bill!"\);/;
const newScan = `if (res.data.rawText) setRawTextPreview(res.data.rawText);
             if (res.data.wordsWithPositions) setWordsWithPositions(res.data.wordsWithPositions);
           alert("Template Rules automatically generated from sample bill!");`;
code = code.replace(regexScan, newScan);

// Replace state
const regexState = /const \[rawTextPreview, setRawTextPreview\] = useState\(''\);/;
const newState = `const [rawTextPreview, setRawTextPreview] = useState('');
  const [wordsWithPositions, setWordsWithPositions] = useState(null);`;
code = code.replace(regexState, newState);

fs.writeFileSync(file, code);
console.log("Fixed APIs in frontend");
