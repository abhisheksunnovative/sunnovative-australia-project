const fs = require('fs');

const tePath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let file = fs.readFileSync(tePath, 'utf8');

const regexOld = `const regex = new RegExp(rule.regex, rule.flags || 'i');
                const match = rawText.match(regex);

                if (match) { 
                    const capturedValue = match.slice(1).find(g => g !== undefined);
                    if (!capturedValue) continue;
                    let val = sanitizeValue(capturedValue, rule.type);
                    
                    // Regex Root-Cause Fix: Reject garbage extractions like "actual meter reading" for category fields
                    if (rule.field === 'meterTypeInfo' || rule.field === 'tariffCategory' || rule.field === 'meterCategory') {
                        if (typeof val === 'string' && val.toLowerCase().includes('reading')) {
                            val = null; // Skip garbage extraction
                        }
                    }
                    if (val !== null) {
                        console.log(\`[TemplateExtractor] Field "\${rule.field}" MATCHED successfully: \${val}\`);
                        extractedData[rule.field] = val;
                        if (rule.required) fieldsMatched++;
                    }
                }`;

const regexNew = `const regex = new RegExp(rule.regex, rule.flags || 'i');
                const match = rawText.match(regex);

                if (match) { 
                    const capturedValue = match.slice(1).find(g => g !== undefined);
                    console.log(\`[TemplateExtractor][\${rule.field}] 🔍 Regex Matched Full String: "\${match[0]}"\`);
                    console.log(\`[TemplateExtractor][\${rule.field}] 🎯 Captured Group Value: "\${capturedValue}"\`);
                    
                    if (!capturedValue) {
                         console.log(\`[TemplateExtractor][\${rule.field}] ⚠️ Match succeeded, but captured group was undefined (possible alternative group issue).\`);
                         continue;
                    }
                    
                    let val = sanitizeValue(capturedValue, rule.type);
                    
                    // Regex Root-Cause Fix: Reject garbage extractions like "actual meter reading" for category fields
                    if (rule.field === 'meterTypeInfo' || rule.field === 'tariffCategory' || rule.field === 'meterCategory') {
                        if (typeof val === 'string' && val.toLowerCase().includes('reading')) {
                            console.log(\`[TemplateExtractor][\${rule.field}] 🗑️ Rejected Garbage Value (contains 'reading'): "\${val}"\`);
                            val = null; // Skip garbage extraction
                        }
                    }
                    
                    if (val !== null) {
                        console.log(\`[TemplateExtractor][\${rule.field}] ✅ FINAL EXTRACTED VALUE: \${val}\`);
                        extractedData[rule.field] = val;
                        if (rule.required) fieldsMatched++;
                    } else {
                        console.log(\`[TemplateExtractor][\${rule.field}] ⚠️ Value became null after sanitization or garbage filter.\`);
                    }
                } else {
                    console.log(\`[TemplateExtractor][\${rule.field}] ❌ Regex FAILED to match: \${rule.regex}\`);
                }`;

if (file.includes(regexOld)) {
  file = file.replace(regexOld, regexNew);
  fs.writeFileSync(tePath, file);
  console.log('Detailed logs added successfully!');
} else if (file.includes(regexOld.replace(/\n/g, '\r\n'))) {
  file = file.replace(regexOld.replace(/\n/g, '\r\n'), regexNew.replace(/\n/g, '\r\n'));
  fs.writeFileSync(tePath, file);
  console.log('Detailed logs added successfully! (CRLF)');
} else {
  console.log('Could not find the target code block.');
}
