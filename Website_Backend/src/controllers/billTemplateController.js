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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing in .env' });
    }
    
    // Import GoogleGenerativeAI dynamically if needed, assuming it's available in module scope
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are an expert OCR template generator. Analyze the provided utility bill image.
Create Regex extraction rules to reliably extract the following fields using Javascript regex (with 1 capture group for the value).
Ensure the regex handles extra spaces and newlines if necessary. Escape backslashes properly for JSON (e.g. \\\\s*).

Return a JSON array of objects strictly following this schema:
[
  {
    "field": "monthlyBill",
    "regex": "Total Amount(?: Payable)?\\\\s*([0-9.]+)",
    "type": "number",
    "required": true
  },
  { "field": "consumerNumber", "regex": "Account No\\\\s*([0-9A-Z]+)", "type": "string", "required": true }
]

Only map these standard fields if you find them: monthlyBill, quarterlyKwh, monthlyUnits, consumerNumber, fullName, tariffCategory, dueDate, meterTypeInfo, state.
Return raw JSON array only.`;

    const imageParts = [{
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype === 'application/pdf' ? 'application/pdf' : req.file.mimetype,
      },
    }];

    
    // Hybrid Strategy: Check if it's a known AU Retailer to bypass Gemini completely and save quota
    let isKnownAU = false;
    let extractedRawText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const { rawText: text, usedOCR: isScanned } = await extractRawText(req.file.buffer, req.file.mimetype);
        extractedRawText = text;
        if (!isScanned) {
          for (const r of AU_RETAILERS) {
            if (r.pattern.test(text)) {
              isKnownAU = true;
              break;
            }
          }
        }
      } catch (e) {
        console.error("PDF extraction fail for AU check", e);
      }
    }

    if (isKnownAU) {
      console.log('[Gemini Aliases] Detected Known AU Retailer. Bypassing Gemini to save API quota.');
      console.log(`[Gemini Aliases] Returning 10 predefined Regex Fields for UI.`);
      const auTemplate = [
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
      
      // Inject Preview Values
      const injectPreview = (templateArray) => {
        if (!extractedRawText) return templateArray;
        return templateArray.map(rule => {
          try {
            const isStrictCase = rule.field === 'fullName' || rule.field === 'fullName';
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

      const validatedAuTemplate = injectPreview(auTemplate);
      console.log(`[Gemini Aliases] ===== FINAL GENERATED TEMPLATE RESPONSE =====`);
      console.log(JSON.stringify(auTemplate, null, 2));
      console.log(`============================================================`);
      return res.status(200).json({ success: true, data: validatedAuTemplate, rawText: extractedRawText });
    }

    console.log('[Gemini Aliases] Sending file to Gemini...');
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([prompt, ...imageParts]);
        break;
      } catch (err) {
        if (err.message && err.message.includes('429')) {
          console.warn('[Gemini] 429 Quota Exceeded. Returning generic fallback template to prevent crash.');
          return res.status(200).json({ success: true, data: [
            { field: "monthlyBill", regex: "Total Amount(?: Payable)?\\s*([0-9.]+)", type: "number", required: true },
            { field: "consumerNumber", regex: "Account No\\s*([0-9A-Z]+)", type: "string", required: true }
          ]});
        }
        if (err.message && err.message.includes('503') && retries > 1) {
          console.warn(`[Gemini] 503 error, retrying in 2 seconds... (${retries - 1} retries left)`);
          await new Promise(res => setTimeout(res, 2000));
          retries--;
        } else {
          throw err;
        }
      }
    }
    let jsonString = result.response.text().trim();
    
    if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.slice(firstBracket, lastBracket + 1);
    }

    let parsed = [];
    try {
      parsed = JSON.parse(jsonString.trim());
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch (parseErr) {
      console.error('[Gemini Aliases] JSON parse failed:', parseErr.message);
      return res.status(200).json({ success: true, data: [] });
    }

    console.log('[Gemini Aliases] ✅ success');
    return res.status(200).json({ success: true, data: validatedGeminiTemplate, rawText: extractedRawText });
  } catch (error) {
    console.error('Error auto-generating aliases with Gemini:', error);
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

    const index = rawText.indexOf(selectedText);
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
        return /^\$?([0-9,]+(\.[0-9]+)?|[0-9]{1,4}[-\/][0-9]{1,2}[-\/][0-9]{1,4})$/.test(word) ||
               /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(word) ||
               /^[0-9]+$/.test(word) ||
               /^[$£€₹:,-]+$/.test(word); // Skip isolated symbols and punctuation
    };

    // 1. Get BEFORE Context (Up to 150 chars)
    const precedingText = rawText.substring(Math.max(0, index - 150), index);
    const beforeWordsRaw = precedingText.split(/[\s\n\r]+/).filter(w => w.length > 0);
    const candidateBefore = beforeWordsRaw.reverse(); // traverse backwards
    
    const stableBeforeWords = [];
    let skippedData = false;
    for (const w of candidateBefore) {
        if (looksLikeData(w)) {
            if (stableBeforeWords.length > 0) break; // Already found real words, stop traversing back
            skippedData = true;
            continue; // Skip data words
        }
        stableBeforeWords.push(w);
        if (stableBeforeWords.length >= 3) break; // We have enough strong anchor words
    }
    stableBeforeWords.reverse(); // Restore normal order
    const anchorBefore = stableBeforeWords.map(escapeRegex).join('[\\s\\n]+');

    // 2. Get AFTER Context (Up to 80 chars)
    const afterText = rawText.substring(index + selectedText.length, index + selectedText.length + 80);
    const afterWordsRaw = afterText.split(/[\s\n\r]+/).filter(w => w.length > 0);
    
    const stableAfterWords = [];
    for (const w of afterWordsRaw) {
        if (looksLikeData(w)) {
            if (stableAfterWords.length > 0) break;
            continue;
        }
        stableAfterWords.push(w);
        if (stableAfterWords.length >= 3) break;
    }
    const anchorAfter = stableAfterWords.map(escapeRegex).join('[\\s\\n]+');

    // 3. Define the Capture Group Type
    let captureGroup = "([^\\n\\r]{2,80}?)"; // Generic string
    if (fieldName === 'monthlyBill' || fieldName === 'dueAmount' || fieldName === 'quarterlyKwh') {
      captureGroup = "([0-9,]+(?:\\.[0-9]+)?)";
    } else if (fieldName === 'dueDate' || fieldName === 'billIssuedDate') {
      if (selectedText.match(/[a-zA-Z]/)) {
        captureGroup = "([0-9]{1,2}\\s+[A-Za-z]{3,9}\\s+[0-9]{2,4})";
      } else {
        captureGroup = "([0-9\\/-]{8,10})";
      }
    } else if (fieldName === 'consumerNumber' || fieldName === 'consumerBillNumber') {
      captureGroup = "([A-Za-z0-9\\- ]{3,25})";
    }

    // 4. Build the Regex with Before and After constraints
    let regexStr = "";
    if (anchorBefore && anchorAfter) {
      regexStr = "(?:" + anchorBefore + ")[\\s\\n:]{0,50}?" + captureGroup + "(?=[\\s\\n]*" + anchorAfter + ")";
    } else if (anchorBefore) {
      regexStr = "(?:" + anchorBefore + ")[\\s\\n:]{0,50}?" + captureGroup;
    } else {
       regexStr = escapeRegex(selectedText).replace(/\d+/g, '\\d+');
    }

    // 5. Test it
    let extracted = "Not Found";
    try {
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

