const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(file, 'utf8');

const targetState = `  const [pdfFile, setPdfFile] = useState(null);
  const [rawTextPreview, setRawTextPreview] = useState('');`;

const newState = `  const [pdfFile, setPdfFile] = useState(null);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [wordsWithPositions, setWordsWithPositions] = useState(null);`;

code = code.replace(targetState, newState);

const targetScan = `           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
             if (res.data.rawText) setRawTextPreview(res.data.rawText);
           alert("Template Rules automatically generated from sample bill!");`;

const newScan = `           setFormData(prev => ({ ...prev, extractionRules: generatedRules }));
             if (res.data.rawText) setRawTextPreview(res.data.rawText);
             if (res.data.wordsWithPositions) setWordsWithPositions(res.data.wordsWithPositions);
           alert("Template Rules automatically generated from sample bill!");`;

code = code.replace(targetScan, newScan);

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

code = code.replace(targetPayloadGen1, newPayloadGen1);

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

code = code.replace(targetPayloadGen2, newPayloadGen2);

const targetSelect = `                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(idx, 'type', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="split-currency">Split Currency</option>
                      </select>`;

const newSelect = `                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(idx, 'type', e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="split-currency">Split Currency</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span>Match Strategy:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name={\`matchStrategy-\${idx}\`} checked={!rule.matchStrategy || rule.matchStrategy === 'inline'} onChange={() => updateRule(idx, 'matchStrategy', 'inline')} className="text-blue-600" />
                        Same-line (Inline)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer" title="Matches data vertically below the heading">
                        <input type="radio" name={\`matchStrategy-\${idx}\`} checked={rule.matchStrategy === 'column-below'} onChange={() => updateRule(idx, 'matchStrategy', 'column-below')} className="text-emerald-600" />
                        Column-below
                      </label>`;

code = code.replace(targetSelect, newSelect);

fs.writeFileSync(file, code);
console.log("Updated UI");
