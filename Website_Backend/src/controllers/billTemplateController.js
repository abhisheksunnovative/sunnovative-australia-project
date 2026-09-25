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
    
    let suggestedAnchor = '';
    if (extractedRawText) {
        const topText = extractedRawText.substring(0, 300);
        const anchors = [];
        
        // Try to find acronyms like PGVCL, PSPCL
        const acronymMatch = topText.match(/\b([A-Z]{4,6})\b/);
        if (acronymMatch && !['DATE', 'BILL', 'TAX', 'GST', 'INVOICE'].includes(acronymMatch[1])) {
            anchors.push(acronymMatch[1]);
        }
        
        // Try to find company names
        const companyMatch = topText.match(/([A-Z][A-Za-z\s]{5,40}(?:Limited|Ltd|Company|Power|Energy|Board|Corporation|Vidyut|Vitran))\b/i);
        if (companyMatch) {
            anchors.push(companyMatch[1].trim());
        }
        
        suggestedAnchor = anchors.join(', ');
    }

    return res.status(200).json({ success: true, data: validatedTemplate, rawText: extractedRawText, suggestedAnchor });
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
    const { rawText, selectedText, fieldName, override, ruleType } = req.body;
    if (!rawText || (!selectedText && !override?.mainData)) {
      return res.status(400).json({ success: false, message: 'Missing rawText or selectedText' });
    }


    let index = -1;
    let mainData = override?.mainData ?? selectedText;
    const { selectionIndex } = req.body;
    
    if (selectionIndex !== undefined && selectionIndex >= 0) {
        index = selectionIndex;
    } else {
        index = rawText.indexOf(mainData);
    }

    // Flexible space matching if exact index not found
    if (index === -1 && mainData) {
        const flexibleSelectedText = mainData.trim().split(/[\s\n\r]+/).map(w => w.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('[\\s\\n\\r]+');
        const match = rawText.match(new RegExp(flexibleSelectedText, 'i'));
        if (match) {
            index = match.index;
            mainData = match[0]; // Update mainData to the actual text in rawText to preserve original spacing
        }
    }

    if (index === -1 && !override) {
      return res.status(400).json({ success: false, message: 'Selected text not found in raw bill text.' });
    }


    // Helper: Escape Regex but keep spaces simple
    const escapeRegex = (str) => {
        let o = '';
        for (const c of str) {
            o += '.*+?^$\{}()|[]\\'.includes(c) ? '\\' + c : c;
        }
        return o;
    };

    const flexible = (str) => escapeRegex(str.trim()).replace(/\s+/g, '[\\s\\n]+');

    // Helper: Looks like data
    const looksLikeData = (word) => {
        if (/^[0-9.,\-$]+$/.test(word)) return true;
        if (/^[0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{2,4}$/.test(word)) return true;
        if (/^[0-9]{1,2}[a-zA-Z]{3}[0-9]{2,4}$/.test(word)) return true;
        return false;
    };

    // Find Stable Anchor Helper
    const findStableAnchor = (textStr, direction) => {
        const wordsRaw = textStr.split(/[\s\n\r]+/).filter(w => w.length > 0);
        let candidateWords = direction === 'before' ? wordsRaw.reverse() : wordsRaw;
        
        const stableWords = [];
        for (let i = 0; i < candidateWords.length; i++) {
            const w = candidateWords[i];
            if (looksLikeData(w)) {
                if (stableWords.length > 0) break;
                continue;
            }
            stableWords.push(w);
            if (stableWords.length >= 3) break;
        }
        
        if (direction === 'before') stableWords.reverse();
        return stableWords.join(' ');
    };

    // CORE LOGIC
    let heading, trailing;

    if (override?.heading !== undefined) {
        heading = override.heading;
    } else {
        const precedingText = rawText.substring(Math.max(0, index - 150), index);
        heading = findStableAnchor(precedingText, 'before');
    }

    if (override?.trailing !== undefined) {
        trailing = override.trailing;
    } else {
        const afterText = rawText.substring(index + mainData.length, index + mainData.length + 80);
        trailing = findStableAnchor(afterText, 'after');
    }

    // Type-specific capture group
    const captureGroups = {
        monthlyBill:   '([0-9,]+(?:\\.[0-9]+)?)',
        quarterlyKwh:  '([0-9,]+(?:\\.[0-9]+)?)',
        dueDate:       '([0-9]{1,2}\\s+[A-Za-z]{3,9}\\s+[0-9]{2,4}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})',
        billIssuedDate:'([0-9]{1,2}\\s+[A-Za-z]{3,9}\\s+[0-9]{2,4}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})',
        default:       '([^\\n\\r]{2,80}?)'
    };
    
    // Map to fieldName provided from frontend
    const mappedType = ['monthlyBill', 'quarterlyKwh', 'dueDate', 'billIssuedDate'].includes(fieldName) ? fieldName : 'default';
    let captureGroup = captureGroups[mappedType];
    
    if (fieldName === 'consumerNumber' || fieldName === 'consumerBillNumber') {
      captureGroup = '([A-Za-z0-9\\- ]{3,25})';
    } else if (fieldName === 'fullName' || fieldName === 'consumerName') {
      captureGroup = "([A-Za-z\\s\\.\\'-]{2,50})";
    } else if (fieldName === 'state') {
      captureGroup = '([A-Za-z]{2,5})';
    }
    if (ruleType === 'split-currency') {
      captureGroup = '([0-9,]+)\\s+([0-9]{1,2})\\b';
    }

    // Build the Regex Parts
    let parts = [];
    if (heading && heading.trim())  {
        parts.push(`(?:(?:${flexible(heading)})[\\s\\S]{0,150}?)`);
    }
    parts.push(captureGroup);
    if (trailing && trailing.trim()) {
        // STRICT LOOKAHEAD: Allows up to 20 non-alphanumeric chars between the value and the trailing word.
        // This acts as a powerful 2D column matcher by forcing the value to be immediately adjacent to the trailing word!
        parts.push(`(?=[^A-Za-z0-9]{0,20}?${flexible(trailing)})`);
    }

    let finalRegex = parts.join('');
    if (!heading?.trim() && !trailing?.trim()) {
        finalRegex = escapeRegex(mainData).replace(/\d+/g, '\\d+');
    }

    let previewValue = 'Not Found';
    try {
        const isStrictCase = fieldName === 'fullName' || fieldName === 'consumerName';
        const match = rawText.match(new RegExp(finalRegex, isStrictCase ? '' : 'i'));


        if (match) {
            if (ruleType === 'split-currency' && match[1] && match[2]) {
                previewValue = parseFloat(match[1].replace(/,/g, '') + '.' + match[2]).toString();
            } else {
                previewValue = match[1] ? match[1].trim() : match[0].trim();
            }
        }
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Regex build error: ' + e.message });
    }

    const warning = (!heading?.trim() && !trailing?.trim())
        ? 'Koi heading/trailing nahi mila — ye field galat data bhi pakad sakti hai kisi doosre bill pe.'
        : null;

    res.json({ success: true, data: { regex: finalRegex, previewValue }, heading, mainData, trailing, warning });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

