const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let code = fs.readFileSync(file, 'utf8');

const regexFunc = /export async function extractData\(rawText, countryContext = 'australia'\) \{/;
code = code.replace(regexFunc, `export async function extractData(rawText, countryContext = 'australia', wordsWithPositions = null) {`);

const regexExtractionBlock = /try \{\s*const isStrictCase = rule\.field === 'fullName' \|\| rule\.field === 'consumerName';\s*const regex = new RegExp\(rule\.regex, rule\.flags \|\| \(isStrictCase \? '' : 'i'\)\);\s*const match = rawText\.match\(regex\);\s*if \(match\) \{\s*const capturedValue = match\.slice\(1\)\.find\(g => g !== undefined\);/;

const newExtractionBlock = `try {
                let capturedValue = null;
                let match = null;

                if (rule.matchStrategy === 'column-below' && wordsWithPositions && rule.heading) {
                    const headingWords = rule.heading.split(/[\\s\\n]+/).filter(w => w.trim());
                    let headingWord = null;
                    if (headingWords.length > 0) {
                        const targetWord = headingWords[headingWords.length - 1]; 
                        const possibleHeadings = wordsWithPositions.filter(w => w.text.toLowerCase().includes(targetWord.toLowerCase()));
                        if (possibleHeadings.length > 0) {
                            headingWord = possibleHeadings[0];
                        }
                    }
                    
                    if (headingWord) {
                        const columnCandidates = wordsWithPositions.filter(w =>
                            Math.abs(w.x - headingWord.x) < 40 &&
                            w.y > headingWord.y + 5
                        ).sort((a, b) => a.y - b.y);
                        
                        if (columnCandidates.length > 0) {
                            capturedValue = columnCandidates[0].text;
                            match = [capturedValue, capturedValue]; // Fake match array
                        }
                    }
                }

                if (!capturedValue) {
                    const isStrictCase = rule.field === 'fullName' || rule.field === 'consumerName';
                    const regex = new RegExp(rule.regex, rule.flags || (isStrictCase ? '' : 'i'));
                    match = rawText.match(regex);
                    if (match) {
                        capturedValue = match.slice(1).find(g => g !== undefined);
                    }
                }

                if (match && capturedValue) {`;

code = code.replace(regexExtractionBlock, newExtractionBlock);

fs.writeFileSync(file, code);
console.log("Updated templateExtractor.js properly!");
