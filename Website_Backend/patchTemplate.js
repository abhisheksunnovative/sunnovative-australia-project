import fs from 'fs';
let content = fs.readFileSync('src/utils/templateExtractor.js', 'utf8');

const regexReplace = /const val = sanitizeValue\(match\[1\], rule\.type\);/m;
const newCode = `let val = sanitizeValue(match[1], rule.type);
                    
                    // Regex Root-Cause Fix: Reject garbage extractions like "actual meter reading" for category fields
                    if (rule.field === 'meterTypeInfo' || rule.field === 'tariffCategory' || rule.field === 'meterCategory') {
                        if (typeof val === 'string' && val.toLowerCase().includes('reading')) {
                            val = null; // Skip garbage extraction
                        }
                    }`;

if (regexReplace.test(content)) {
    content = content.replace(regexReplace, newCode);
    fs.writeFileSync('src/utils/templateExtractor.js', content);
    console.log("Template extractor tightened.");
} else {
    console.log("Regex not found in templateExtractor.");
}
