import BillTemplate from '../models/BillTemplate.js';

function sanitizeValue(value, type) {
    if (!value) return null;
    value = value.trim();
    
    try {
        switch (type) {
            case 'number':
                const numStr = value.replace(/[^0-9.]/g, '');
                return numStr ? parseFloat(numStr) : null;
            case 'string':
            default:
                return value;
        }
    } catch (e) {
        return value;
    }
}

export async function extractData(rawText, countryContext = 'australia', wordsWithPositions = null) {
    try {
        console.log(`[TemplateExtractor] Searching for matching template in ${countryContext}...`);
        
        const templates = await BillTemplate.find({ country: countryContext, isActive: true }).sort({ updatedAt: -1 });
        
        if (!templates || templates.length === 0) {
            return { extractedData: {}, matchedTemplate: null, confidenceScore: 0, status: 'manual-review' };
        }

        let matchedTemplate = null;

        for (const template of templates) {
            const isMatch = template.anchorKeywords.some(keyword => {
                try {
                    // 1. Try exact match first (escaping special regex characters)
                    const exactRegex = new RegExp(keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
                    if (exactRegex.test(rawText)) return true;

                    // 2. Fuzzy 50% Word Match Logic
                    const words = keyword.split(/[\s-]+/).filter(w => w.trim().length > 2); // Ignore short words like 'of', 'co'
                    if (words.length <= 1) return false; // If only 1 word, exact match already failed

                    // Check how many words match in the top part of the bill
                    const topText = rawText.substring(0, 1500); 
                    let matchCount = 0;
                    for (const word of words) {
                        const wordRegex = new RegExp(word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
                        if (wordRegex.test(topText)) {
                            matchCount++;
                        }
                    }
                    
                    const matchPercentage = matchCount / words.length;
                    if (matchPercentage >= 0.5) {
                        console.log(`[TemplateExtractor] Fuzzy matched anchor "${keyword}" (${matchCount}/${words.length} words matched)`);
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
        }

        if (!matchedTemplate) {
            console.warn("[TemplateExtractor] Unknown Discom format. Sending to Manual Review.");
            return {
                success: false,
                confidenceScore: 0,
                message: "Unknown Discom. Manual Review Required.",
                extractedData: {},
                rawTextPreview: rawText.substring(0, 500)
            };
        }

        console.log(`\n======================================================`);
        console.log(`[TemplateExtractor] 🌟 USING YOUR SAVED TEMPLATE: ${matchedTemplate.discomName}`);
        console.log(`[TemplateExtractor] 🕒 Template Last Updated: ${matchedTemplate.updatedAt}`);
        console.log(`[TemplateExtractor] 📏 Total Rules Inside: ${matchedTemplate.extractionRules.length}`);
        console.log(`======================================================\n`);

        const extractedData = {
            retailer: matchedTemplate.discomName,
            country: matchedTemplate.country
        };
        
        let fieldsMatched = 0;
        let totalRequiredFields = 0;

        for (const rule of matchedTemplate.extractionRules) {
            if (rule.required) totalRequiredFields++;

            try {
                let capturedValue = null;
                let match = null;

                if (rule.matchStrategy === 'column-below' && wordsWithPositions && rule.heading) {
                    const headingWords = rule.heading.split(/[\s\n]+/).filter(w => w.trim());
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
                    Math.abs(w.x - headingWord.x) < 80 &&
                    w.y > headingWord.y + 5 // Below the heading
                ).sort((a, b) => {
                    // If on the same line (within 5px Y), pick the one most perfectly aligned vertically with heading X
                    if (Math.abs(a.y - b.y) < 5) {
                        return Math.abs(a.x - headingWord.x) - Math.abs(b.x - headingWord.x);
                    }
                    return a.y - b.y;
                });
                        
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

                if (match && capturedValue) {
                    console.log(`[TemplateExtractor][${rule.field}] 🔍 Regex Matched Full String: "${match[0]}"`);
                    console.log(`[TemplateExtractor][${rule.field}] 🎯 Captured Group Value: "${capturedValue}"`);
                    
                    if (!capturedValue) {
                         console.log(`[TemplateExtractor][${rule.field}] ⚠️ Match succeeded, but captured group was undefined (possible alternative group issue).`);
                         continue;
                    }
                    
                    let val = sanitizeValue(capturedValue, rule.type);
                    
                    // Regex Root-Cause Fix: Reject garbage extractions like "actual meter reading" for category fields
                    if (rule.field === 'meterTypeInfo' || rule.field === 'tariffCategory' || rule.field === 'meterCategory') {
                        if (typeof val === 'string' && val.toLowerCase().includes('reading')) {
                            console.log(`[TemplateExtractor][${rule.field}] 🗑️ Rejected Garbage Value (contains 'reading'): "${val}"`);
                            val = null; // Skip garbage extraction
                        }
                    }
                    
                    if (val !== null) {
                        console.log(`[TemplateExtractor][${rule.field}] ✅ FINAL EXTRACTED VALUE: ${val}`);
                        extractedData[rule.field] = val;
                        if (rule.required) fieldsMatched++;
                    } else {
                        console.log(`[TemplateExtractor][${rule.field}] ⚠️ Value became null after sanitization or garbage filter.`);
                    }
                } else {
                    console.log(`[TemplateExtractor][${rule.field}] FAILED MATCH. String length: ${rawText.length}, Regex used: ${regex}`);
                }
            } catch (err) {
                console.error(`[TemplateExtractor] Invalid regex for field ${rule.field}: ${rule.regex}`, err);
            }
        }

        let confidenceScore = 100;
        if (totalRequiredFields > 0) {
            confidenceScore = Math.round((fieldsMatched / totalRequiredFields) * 100);
        }

        console.log(`[TemplateExtractor] Extraction Complete. Confidence: ${confidenceScore}%`);

        let status = 'auto-save';
        if (confidenceScore < 40) status = 'manual-review';
        else if (confidenceScore < 80) status = 'needs-review';

        console.log('\n======================================================');
        console.log('[TemplateExtractor] ✅ SCAN COMPLETED!');
        console.log(`[TemplateExtractor] Discom Template Used: ${matchedTemplate.discomName}`);
        console.log(`[TemplateExtractor] Confidence Score: ${confidenceScore}%`);
        console.log('[TemplateExtractor] FINAL EXTRACTED DATA (JSON):');
        console.log(JSON.stringify(extractedData, null, 2));
        console.log('======================================================\n');

        return {
            success: true,
            status,
            confidenceScore,
            templateUsed: matchedTemplate.discomName,
            extractedData
        };

    } catch (error) {
        console.error("[TemplateExtractor] Error during extraction:", error);
        throw error;
    }
}
