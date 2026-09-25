const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = `        for (const template of templates) {
            const isMatch = template.anchorKeywords.some(keyword => {
                const regex = new RegExp(keyword, 'i');
                return regex.test(rawText);
            });

            if (isMatch) {
                matchedTemplate = template;
                break;
            }
        }`;

const newLogic = `        for (const template of templates) {
            const isMatch = template.anchorKeywords.some(keyword => {
                try {
                    // 1. Try exact match first (escaping special regex characters)
                    const exactRegex = new RegExp(keyword.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&'), 'i');
                    if (exactRegex.test(rawText)) return true;

                    // 2. Fuzzy 50% Word Match Logic
                    const words = keyword.split(/[\\s\\-]+/).filter(w => w.trim().length > 2); // Ignore short words like 'of', 'co'
                    if (words.length <= 1) return false; // If only 1 word, exact match already failed

                    // Check how many words match in the top part of the bill
                    const topText = rawText.substring(0, 1500); 
                    let matchCount = 0;
                    for (const word of words) {
                        const wordRegex = new RegExp(word.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&'), 'i');
                        if (wordRegex.test(topText)) {
                            matchCount++;
                        }
                    }
                    
                    const matchPercentage = matchCount / words.length;
                    if (matchPercentage >= 0.5) {
                        console.log(\`[TemplateExtractor] Fuzzy matched anchor "\${keyword}" (\${matchCount}/\${words.length} words matched)\`);
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.warn("[TemplateExtractor] Regex error on anchor keyword:", keyword);
                    return false;
                }
            });

            if (isMatch) {
                matchedTemplate = template;
                break;
            }
        }`;

// Use a replacer function to avoid $& replacement issues!
code = code.replace(oldLogic, () => newLogic);
fs.writeFileSync(file, code);
console.log("Patched templateExtractor.js for fuzzy anchor matching safely");
