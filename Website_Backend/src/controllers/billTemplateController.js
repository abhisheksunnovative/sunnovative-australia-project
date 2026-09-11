import { GoogleGenerativeAI } from '@google/generative-ai';
import { BillTemplate } from '../models/BillTemplate.js';

// 1. Create a new Template (Admin use)
export const createTemplate = async (req, res) => {
  try {
    if (!req.body.effective_from) {
      req.body.effective_from = new Date();
    }
    const template = await BillTemplate.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Get all Templates (Admin use to view list)
export const getTemplates = async (req, res) => {
  try {
    const templates = await BillTemplate.find().populate('discom_id');
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update an existing Template (Admin use to change rules)
export const updateTemplate = async (req, res) => {
  try {
    const template = await BillTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });

    const prompt = `
You are an expert OCR template generator for electricity bills. 
Analyze the provided bill image/pdf. Identify the EXACT textual labels/headings printed on the bill that correspond to the following standard fields.
Return a valid JSON object where the keys are the standard fields, and the values are ARRAYS of strings (the exact labels found on the bill, e.g. ["Account No", "Customer No"]).

Required Schema:
{
  "consumer_number": ["string"],
  "units_consumed": ["string"],
  "total_bill": ["string"],
  "billing_period": ["string"],
  "due_date": ["string"],
  "customer_name": ["string"],
  "discom_name": ["string"],
  "tariff": ["string"],
  "consumer_type": ["string"]
}
`;

    const imageParts = [{
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype === 'application/pdf' ? 'application/pdf' : req.file.mimetype,
      },
    }];

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([prompt, ...imageParts]);
        break; 
      } catch (err) {
        if (err.message && err.message.includes('503') && retries > 1) {
          console.warn(`Gemini 503 error, retrying in 2 seconds... (${retries - 1} retries left)`);
          await delay(2000);
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

    const parsed = JSON.parse(jsonString.trim());
    
    // Default fallback if some keys are missing
    const finalAliases = {
      consumer_number: parsed.consumer_number || [],
      units_consumed: parsed.units_consumed || [],
      total_bill: parsed.total_bill || [],
      billing_period: parsed.billing_period || [],
      due_date: parsed.due_date || [],
      customer_name: parsed.customer_name || [],
      discom_name: parsed.discom_name || [],
      tariff: parsed.tariff || [],
      consumer_type: parsed.consumer_type || []
    };

    res.status(200).json({ success: true, data: finalAliases });
  } catch (error) {
    console.error('Error auto-generating aliases with Gemini:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};
