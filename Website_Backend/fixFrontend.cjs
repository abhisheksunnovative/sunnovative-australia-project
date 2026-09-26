const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add state
const targetState = `  const [pdfFile, setPdfFile] = useState(null);
  const [rawTextPreview, setRawTextPreview] = useState('');`;
const newState = `  const [pdfFile, setPdfFile] = useState(null);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [wordsWithPositions, setWordsWithPositions] = useState(null);`;
if (code.includes(targetState)) code = code.replace(targetState, newState);

// 2. Add wordsWithPositions to scan
const targetScan = `           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
             if (res.data.rawText) setRawTextPreview(res.data.rawText);
           alert("Template Rules automatically generated from sample bill!");`;
const newScan = `           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
             if (res.data.rawText) setRawTextPreview(res.data.rawText);
             if (res.data.wordsWithPositions) setWordsWithPositions(res.data.wordsWithPositions);
           alert("Template Rules automatically generated from sample bill!");`;
if (code.includes(targetScan)) code = code.replace(targetScan, newScan);

// 3. Add to handleHighlightGenerate payload
const targetPayloadGen1 = `        rawText: rawTextPreview,
        selectedText: selection,
        fieldName: fieldName,
        ruleType: typeToUse,
        selectionIndex: selectionIndex`;
const newPayloadGen1 = `        rawText: rawTextPreview,
        selectedText: selection,
        fieldName: fieldName,
        ruleType: typeToUse,
        selectionIndex: selectionIndex,
        wordsWithPositions: wordsWithPositions`;
if (code.includes(targetPayloadGen1)) code = code.replace(targetPayloadGen1, newPayloadGen1);

// 4. Add to handleRegenerate payload
const targetPayloadGen2 = `        rawText: rawTextPreview,
        selectedText: rule.mainData,
        fieldName: fieldName,
        ruleType: rule.type,
        override: {
            heading: rule.heading,
            mainData: rule.mainData,
            trailing: rule.trailing
        }`;
const newPayloadGen2 = `        rawText: rawTextPreview,
        selectedText: rule.mainData,
        fieldName: fieldName,
        ruleType: rule.type,
        wordsWithPositions: wordsWithPositions,
        override: {
            heading: rule.heading,
            mainData: rule.mainData,
            trailing: rule.trailing,
            matchStrategy: rule.matchStrategy
        }`;
if (code.includes(targetPayloadGen2)) code = code.replace(targetPayloadGen2, newPayloadGen2);

// 5. Add Match Strategy UI properly inside grid-cols-4!
const regexSelect = /<select value=\{rule\.type\}([\s\S]*?)<\/select>\s*<\/div>/;

const newSelect = `<select value={rule.type}$1</select>
                        </div>
                        <div className="col-span-4 mt-1 flex items-center gap-4 text-[10px] font-medium text-slate-600 bg-slate-100 p-1.5 rounded border border-slate-200">
                          <span>Match Strategy:</span>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={!rule.matchStrategy || rule.matchStrategy === 'inline'} onChange={() => updateRule(idx, 'matchStrategy', 'inline')} className="text-blue-600 w-3 h-3" />
                            Same-line (Inline)
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer" title="Matches data vertically below the heading">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={rule.matchStrategy === 'column-below'} onChange={() => updateRule(idx, 'matchStrategy', 'column-below')} className="text-emerald-600 w-3 h-3" />
                            Column-below
                          </label>
                        </div>`;
code = code.replace(regexSelect, newSelect);

fs.writeFileSync(file, code);
console.log("Fixed Frontend!");
