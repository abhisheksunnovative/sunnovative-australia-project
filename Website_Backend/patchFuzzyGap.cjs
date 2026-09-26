const fs = require('fs');

// Patch 1: Frontend
const uiFile = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let uiCode = fs.readFileSync(uiFile, 'utf8');

const uiRegex = /<label className="flex items-center gap-1 cursor-pointer" title="Matches data vertically below the heading">\s*<input type="radio" name=\{\`matchStrategy-\$\{idx\}\`\} checked=\{rule\.matchStrategy === 'column-below'\} onChange=\{\(\) => updateRule\(idx, 'matchStrategy', 'column-below'\)\} className="text-emerald-600 w-3 h-3" \/>\s*Column-below\s*<\/label>/;

const uiNew = `<label className="flex items-center gap-1 cursor-pointer" title="Matches data vertically below the heading">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={rule.matchStrategy === 'column-below'} onChange={() => updateRule(idx, 'matchStrategy', 'column-below')} className="text-emerald-600 w-3 h-3" />
                            Column-below
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer" title="Skips extra text (like years) and jumps across a wide space to find the value">
                            <input type="radio" name={\`matchStrategy-\${idx}\`} checked={rule.matchStrategy === 'inline-gap'} onChange={() => updateRule(idx, 'matchStrategy', 'inline-gap')} className="text-purple-600 w-3 h-3" />
                            Fuzzy / Gap Skip
                          </label>`;

if (uiCode.includes('Column-below')) {
    uiCode = uiCode.replace(uiRegex, uiNew);
    fs.writeFileSync(uiFile, uiCode);
    console.log("Patched Frontend UI");
}

// Patch 2: Backend
const apiFile = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let apiCode = fs.readFileSync(apiFile, 'utf8');

const apiRegex = /let parts = \[\];\s*if \(heading && heading\.trim\(\)\)\s*\{\s*parts\.push\(\`\(\?:\(\?\:\$\{flexible\(heading\)\}\)\[\\\\s\\\\S\]\{0,150\}\?\)\`\);\s*\}/;

const apiNew = `let parts = [];
    if (heading && heading.trim())  {
        if (override?.matchStrategy === 'inline-gap') {
            parts.push(\`(?:(?:\${flexible(heading)})[^\\\\n\\\\r]{0,150}?\\\\s{3,})\`);
        } else {
            parts.push(\`(?:(?:\${flexible(heading)})[\\\\s\\\\S]{0,150}?)\`);
        }
    }`;

if (apiCode.includes('let parts = [];')) {
    apiCode = apiCode.replace(apiRegex, apiNew);
    fs.writeFileSync(apiFile, apiCode);
    console.log("Patched Backend API");
}
