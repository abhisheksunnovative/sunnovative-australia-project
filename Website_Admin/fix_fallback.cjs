const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Admin/src/components/BillTemplateManagementScreen.jsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `          } else {
              selectionIndex = rawTextPreview.indexOf(selection);
              console.log(\`[Frontend] ⚠️ Fallback to basic indexOf: \${selectionIndex}\`);
          }`;

const replacementStr = `          } else {
              selectionIndex = rawTextPreview.indexOf(selection);
              
              // Smart fallback if exact text isn't found due to PDF.js spacing/formatting artifacts
              if (selectionIndex === -1) {
                  const noComma = selection.replace(/,/g, '');
                  selectionIndex = rawTextPreview.indexOf(noComma);
                  if (selectionIndex !== -1) selection = noComma;
                  else {
                      const noDollar = selection.replace(/\\$/g, '');
                      selectionIndex = rawTextPreview.indexOf(noDollar);
                      if (selectionIndex !== -1) selection = noDollar;
                      else {
                          const noBoth = noDollar.replace(/,/g, '');
                          selectionIndex = rawTextPreview.indexOf(noBoth);
                          if (selectionIndex !== -1) selection = noBoth;
                      }
                  }
              }
              console.log(\`[Frontend] ⚠️ Fallback to basic indexOf: \${selectionIndex}, using string: \${selection}\`);
          }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(path, code);
console.log("Added smart indexOf fallback");
