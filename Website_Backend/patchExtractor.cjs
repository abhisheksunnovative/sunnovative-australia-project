const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(file, 'utf8');

const targetFuncSig = `export async function extractData(rawText, countryContext = 'australia') {`;
const newFuncSig = `export async function extractData(rawText, countryContext = 'australia', wordsWithPositions = null) {`;
code = code.replace(targetFuncSig, newFuncSig);

const targetRegexExec = `                let extracted = null;
                try {
                    const testRegex = new RegExp(rule.regex, (rule.field === 'fullName' || rule.field === 'consumerName') ? '' : 'i');
                    const match = rawText.match(testRegex);
                    if (match) {
                        if (rule.type === 'split-currency' && match[1] && match[2]) {
                            extracted = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();
                        } else {
                            const val = match.slice(1).find(v => v !== undefined);
                            extracted = val ? val.trim() : match[0].trim();
                        }
                    }
                } catch (e) {
                    console.warn(\`[TemplateExtractor] Invalid regex for field \${rule.field}: \${rule.regex}\`);
                }

                if (extracted) {`;

const newRegexExec = `                let extracted = null;
                
                if (rule.matchStrategy === 'column-below' && wordsWithPositions && rule.heading) {
                    const headingWords = rule.heading.split(/[\\s\\n]+/).filter(w => w.trim());
                    let headingWord = null;
                    if (headingWords.length > 0) {
                        const targetWord = headingWords[headingWords.length - 1]; // Use last word of heading to anchor
                        headingWord = wordsWithPositions.find(w => w.text.toLowerCase().includes(targetWord.toLowerCase()));
                    }
                    
                    if (headingWord) {
                        // Find words in same column (X within +/- 40) and below (Y > heading Y)
                        const columnCandidates = wordsWithPositions.filter(w =>
                            Math.abs(w.x - headingWord.x) < 40 &&
                            w.y > headingWord.y + 10 // At least 10px below
                        ).sort((a, b) => a.y - b.y);
                        
                        if (columnCandidates.length > 0) {
                            extracted = columnCandidates[0].text;
                            if (rule.type === 'number') {
                                const numMatch = extracted.match(/[0-9,\\.]+/);
                                if (numMatch) extracted = numMatch[0];
                            }
                        }
                    }
                }

                if (!extracted) {
                    try {
                        const testRegex = new RegExp(rule.regex, (rule.field === 'fullName' || rule.field === 'consumerName') ? '' : 'i');
                        const match = rawText.match(testRegex);
                        if (match) {
                            if (rule.type === 'split-currency' && match[1] && match[2]) {
                                extracted = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();
                            } else {
                                const val = match.slice(1).find(v => v !== undefined);
                                extracted = val ? val.trim() : match[0].trim();
                            }
                        }
                    } catch (e) {
                        console.warn(\`[TemplateExtractor] Invalid regex for field \${rule.field}: \${rule.regex}\`);
                    }
                }

                if (extracted) {`;

code = code.replace(targetRegexExec, newRegexExec);

fs.writeFileSync(file, code);
console.log("Updated templateExtractor.js");
