import ScanAnalytics from '../models/ScanAnalytics.js';
/**
 * billTemplateController.js
 *
 * Reverted to Gemini API (gemini-3.6-flash) for best accuracy.
 * Uses native Vision capability (sending image/PDF directly) instead of OCR.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BillTemplate } from '../models/BillTemplate.js';

// 1. Create a new Template (Admin use)
export const createTemplate = async (req, res) => {
  try {
    if (!req.body.effective_from) {
      req.body.effective_from = new Date();
    }
    req.body.engineVersion = 'v2.4_latest';
    req.body.isActive = true;
    
        const template = await BillTemplate.findOneAndUpdate(
      { country: req.body.country, discomName: req.body.discomName },
      { $set: req.body },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    
    if (req.body.sourceScanAnalyticsId) {
      await ScanAnalytics.findByIdAndUpdate(req.body.sourceScanAnalyticsId, {
        resolvedTemplateId: template._id
      });
    }
    
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

  // 2. Get all Templates (Admin use to view list)
export const getTemplates = async (req, res) => {
  try {
    const templates = await BillTemplate.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update an existing Template (Admin use to change rules)
export const updateTemplate = async (req, res) => {
  try {
    req.body.engineVersion = 'v2.4_latest';
      req.body.isActive = true;
      const template = await BillTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Auto-generate aliases from bill image/PDF using Gemini (Multimodal)
import { AU_RETAILERS, AU_DICT } from '../utils/RegexDictionary.js';
import { extractRawText } from '../utils/billParser.js';

export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isAU = req.body.country === 'australia' || req.body.country === 'AU' || (req.headers['x-country'] || '').toLowerCase() === 'australia';
    
    let extractedRawText = '';
    try {
        const { rawText: text } = await extractRawText(req.file.buffer, req.file.mimetype);
        extractedRawText = text;
    } catch (e) {
        console.error("PDF extraction fail", e);
    }

    console.log('[Aliases Builder] Bypassing Gemini to save API quota. Generating manual template for:', isAU ? 'AU' : 'IN');
    
    let templateFields = [];
    if (isAU) {
        templateFields = [
            { field: "fullName", regex: AU_DICT.namePatterns.join('|'), type: "string", required: false },
            { field: "consumerNumber", regex: AU_DICT.accountNumber, type: "string", required: false },
            { field: "consumerBillNumber", regex: AU_DICT.billNumber, type: "string", required: false },
            { field: "meterCategory", regex: "(Smart\\s*Meter|Interval|Basic\\s*Meter|Accumulation\\s*Meter)", type: "string", required: false },
            { field: "tariffCategory", regex: AU_DICT.tariffCategory, type: "string", required: false },
            { field: "monthlyBill", regex: AU_DICT.amountPatterns.join('|'), type: "number", required: true },
            { field: "billIssuedDate", regex: AU_DICT.billIssueDate, type: "string", required: false },
            { field: "quarterlyKwh", regex: AU_DICT.usagePatterns.join('|'), type: "number", required: false },
            { field: "state", regex: "(?:VIC|NSW|QLD|WA|SA|TAS|ACT|NT|Victoria|New\\s*South\\s*Wales|Queensland|Western\\s*Australia|South\\s*Australia|Tasmania)", type: "string", required: false },
            { field: "dueDate", regex: AU_DICT.dueDate, type: "string", required: false }
        ];
    } else {
        templateFields = [
            { field: "fullName", regex: "Name(?:[:\\-\\s]+)([A-Za-z\\s]+)", type: "string", required: false },
            { field: "consumerNumber", regex: "(?:Consumer\\s*No|Account\\s*No|K\\.NO|Consumer\\s*Number)[\\s:.]*([0-9A-Z]+)", type: "string", required: false },
            { field: "tariffCategory", regex: "(?:Tariff|Category|Tariff\\s*Category)[\\s:.]*([A-Za-z0-9\\-]+)", type: "string", required: false },
            { field: "monthlyBill", regex: "(?:Total\\s*Amount|Net\\s*Amount|Amount\\s*Payable)[\\s:.]*(?:Rs\\.?|₹)?\\s*([0-9,.]+)", type: "number", required: true },
            { field: "billIssuedDate", regex: "(?:Bill\\s*Date|Issue\\s*Date)[\\s:.]*([0-9]{2}[\\/\\-][0-9]{2}[\\/\\-][0-9]{2,4})", type: "string", required: false },
            { field: "monthlyUnits", regex: "(?:Units\\s*Consumed|Billed\\s*Units|Consumption)[\\s:.]*([0-9]+)", type: "number", required: false },
            { field: "dueDate", regex: "(?:Due\\s*Date)[\\s:.]*([0-9]{2}[\\/\\-][0-9]{2}[\\/\\-][0-9]{2,4})", type: "string", required: false },
            { field: "state", regex: "(Gujarat|Maharashtra|Delhi|Haryana|Punjab|Rajasthan)", type: "string", required: false },
            { field: "discomId", regex: "(PGVCL|MGVCL|UGVCL|DGVCL|MSEDCL|DHBVN|UHBVN)", type: "string", required: false }
        ];
    }

    // Inject Preview Values
    const injectPreview = (templateArray) => {
        if (!extractedRawText) return templateArray;
        return templateArray.map(rule => {
            try {
                const isStrictCase = rule.field === 'fullName';
                const regex = new RegExp(rule.regex, isStrictCase ? '' : 'i');
                const match = extractedRawText.match(regex);
                if (match) {
                    const val = match.slice(1).find(v => v !== undefined);
                    rule.previewValue = val ? val.trim() : match[0].trim();
                } else {
                    rule.previewValue = 'Not Found';
                }
            } catch(e) {
                rule.previewValue = 'Regex Error';
            }
            return rule;
        });
    };

    const validatedTemplate = injectPreview(templateFields);
    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText });
  } catch (error) {
    console.error('Error auto-generating aliases without Gemini:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};

// PATCH /api/admin/bill-templates/:id/approve
export const approveTemplate = async (req, res) => {
  try {
    const template = await BillTemplate.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isActive: true },
      { new: true }
    );
    res.json({ success: true, template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/bill-templates/stale
export const getStaleTemplates = async (req, res) => {
  try {
    const stale = await BillTemplate.find({ engineVersion: { $ne: 'v2.2' }, isActive: true });
    res.json({ count: stale.length, templates: stale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 5. Generate Regex from Highlighted Text (100% Offline, Smart Anchor Logic)
export const generateRegexFromSelection = async (req, res) => {
  try {
    const { rawText, selectedText, fieldName } = req.body;
    if (!rawText || !selectedText) {
      return res.status(400).json({ success: false, message: 'Missing rawText or selectedText' });
    }

    let index = -1;
    const { selectionIndex } = req.body;
    console.log(`[Backend] 📍 Received selectionIndex: ${selectionIndex}`);
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        const searchWindowStart = Math.max(0, selectionIndex - 500);
        const searchWindowEnd = Math.min(rawText.length, selectionIndex + selectedText.length + 500);
        const windowText = rawText.substring(searchWindowStart, searchWindowEnd);
        const windowMatchIndex = windowText.indexOf(selectedText);
        if (windowMatchIndex !== -1) {
            index = searchWindowStart + windowMatchIndex;
        } else {
            index = rawText.indexOf(selectedText);
        }
    } else {
        index = rawText.indexOf(selectedText);
    }
    console.log(`[Backend] 🎯 Final index used: ${index}`);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Selected text not found in the bill.' });
    }

    const escapeRegex = (str) => {
       let escaped = "";
       for (let i = 0; i < str.length; i++) {
          if ("-\\/^$*+?.()|[]{}".includes(str[i])) {
             escaped += "\\" + str[i];
          } else {
             escaped += str[i];
          }
       }
       return escaped;
    };

    // Smart anchor logic to skip data-like words (numbers, dates, months)
    const looksLikeData = (word) => {
        if (word.includes('\uFFFD')) return true; // Skip corrupted PDF characters
        return /^\$?([0-9,]+(\.[0-9]+)?|[0-9]{1,4}[-\/][0-9]{1,2}[-\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word) ||
               /^[^a-zA-Z0-9]+$/.test(word); // Skip anything that is pure symbols/punctuation
    };

    // Helper to transform gap text into a safe regex gap
    const buildGapRegex = (gapText) => {
        if (!gapText || gapText.trim() === '') return "[\\s\\n:$,\\-]{0,50}?";
        
        let gapRegex = "";
        // Split by whitespace but keep the whitespace tokens
        const tokens = gapText.split(/([\s\n\r]+)/);
        for (const token of tokens) {
            if (/^[\s\n\r]+$/.test(token)) {
                gapRegex += "[\\s\\n]+";
            } else if (looksLikeData(token)) {
                // If it's a number/data, replace with a generic data matcher
                if (/^[0-9.,]+$/.test(token) || /^\$?[0-9.,]+$/.test(token)) {
                    gapRegex += "\\$?[0-9.,]+";
                } else if (/[a-zA-Z]/.test(token) && /[0-9]/.test(token)) {
                    gapRegex += "[A-Za-z0-9\\/-]+";
                } else {
                    gapRegex += "[\\s\\S]{1," + (token.length + 5) + "}?";
                }
            } else {
                // If it's a symbol or something else
                gapRegex += escapeRegex(token);
            }
        }
        return gapRegex;
    };

    // 1. Get BEFORE Context (Up to 150 chars)
    const precedingText = rawText.substring(Math.max(0, index - 150), index);
    const beforeWordsRaw = precedingText.split(/[\s\n\r]+/).filter(w => w.length > 0);
    const candidateBefore = beforeWordsRaw.reverse(); 
    
    const stableBeforeWords = [];
    let skippedDataBefore = false;
    let anchorBeforeEndIndexRaw = -1;

    for (let i = 0; i < candidateBefore.length; i++) {
        const w = candidateBefore[i];
        if (looksLikeData(w)) {
            if (stableBeforeWords.length > 0) break;
            skippedDataBefore = true;
            continue;
        }
        stableBeforeWords.push(w);
        if (stableBeforeWords.length === 1) {
             // Record where the stable anchor ended in the original text (working backwards)
             // We need to find this word's position in precedingText
             anchorBeforeEndIndexRaw = precedingText.lastIndexOf(w) + w.length;
        }
        if (stableBeforeWords.length >= 3) break;
    }
    stableBeforeWords.reverse();
    const anchorBefore = stableBeforeWords.map(escapeRegex).join('[\\s\\n]+');
    
    let gapBeforeRegex = "[\\s\\n:$,\\-]{0,50}?";
    if (skippedDataBefore && anchorBeforeEndIndexRaw !== -1) {
         const gapText = precedingText.substring(anchorBeforeEndIndexRaw);
         gapBeforeRegex = buildGapRegex(gapText);
    }

    // 2. Get AFTER Context (Up to 80 chars)
    const afterText = rawText.substring(index + selectedText.length, index + selectedText.length + 80);
    const afterWordsRaw = afterText.split(/[\s\n\r]+/).filter(w => w.length > 0);
    
    const stableAfterWords = [];
    let skippedDataAfter = false;
    let anchorAfterStartIndexRaw = -1;

    for (let i = 0; i < afterWordsRaw.length; i++) {
        const w = afterWordsRaw[i];
        if (looksLikeData(w)) {
            if (stableAfterWords.length > 0) break;
            skippedDataAfter = true;
            continue;
        }
        if (stableAfterWords.length === 0) {
            anchorAfterStartIndexRaw = afterText.indexOf(w);
        }
        stableAfterWords.push(w);
        if (stableAfterWords.length >= 3) break;
    }
    const anchorAfter = stableAfterWords.map(escapeRegex).join('[\\s\\n]+');
    
    // We already use [\s\S]{0,150}? for the after gap in step 4, which naturally skips data.
    // So we don't strictly need a strict gapAfterRegex, but we leave the logic available.

    // 3. Define the Capture Group Type
    let captureGroup = "([^\\n\\r]{2,80}?)"; // Generic string (fallback)
    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
      captureGroup = "([0-9,]+(?:\\.[0-9]+)?)";
    } else if (fieldName === 'dueDate' || fieldName === 'billIssuedDate') {
      if (selectedText.match(/[a-zA-Z]/)) {
        captureGroup = "([0-9]{1,2}\\s+[A-Za-z]{3,9}\\s+[0-9]{2,4})";
      } else {
        captureGroup = "([0-9\\/-]{8,10})";
      }
    } else if (fieldName === 'consumerNumber' || fieldName === 'consumerBillNumber') {
      captureGroup = "([A-Za-z0-9\\- ]{3,25})"; // Greedy alphanumeric
    } else if (fieldName === 'fullName' || fieldName === 'consumerName') {
      captureGroup = "([A-Za-z\\s\\.\\'-]{2,50})"; // Greedy name characters only
    } else if (fieldName === 'state') {
      captureGroup = "([A-Za-z]{2,5})"; // e.g. NSW, WA, VIC
    }

    // 4. Build the Regex with Before and After constraints
        console.log(`[Backend] 🛑 Anchor Before Chosen: "${anchorBefore}"`);
    console.log(`[Backend] 🛑 Anchor After Chosen: "${anchorAfter}"`);
    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")" + gapBeforeRegex + captureGroup + "(?=[\\s\\S]{0,150}?" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")" + gapBeforeRegex + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\d+/g, '\\d+');
    }

    // 5. Test it
    let extracted = "Not Found";
    try {
      console.log(`[Backend] ⚙️ Generated Regex: ${regexStr}`);
      const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
      const testRegex = new RegExp(regexStr, isStrictCase ? '' : 'i');
      const match = rawText.match(testRegex);
      if (match) {
         if (match[1] !== undefined) {
             extracted = match[1].trim();
         } else {
             extracted = match[0].trim();
         }
      }
    } catch (e) {
      extracted = "Invalid Regex Generated";
    }

    res.status(200).json({ success: true, data: { regex: regexStr, previewValue: extracted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

