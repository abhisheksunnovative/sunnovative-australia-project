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

// 4. Auto-generate aliases from bill image/PDF using Gemini (Multimodal)
export const autoGenerateAliases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing in .env' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });

    const prompt = `You are an expert OCR template generator for Indian electricity bills (DISCOMs). 
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
}`;

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
        console.log(`[Gemini Aliases] Sending file to Gemini...`);
        result = await model.generateContent([prompt, ...imageParts]);
        break; 
      } catch (err) {
        if (err.message && err.message.includes('503') && retries > 1) {
          console.warn(`[Gemini] 503 error, retrying in 2 seconds... (${retries - 1} retries left)`);
          await delay(2000);
          retries--;
        } else {
          throw err; 
        }
      }
    }

    if (!result) {
      throw new Error('Gemini failed to return a response after retries.');
    }

    let jsonString = result.response.text().trim();
    
    // Cleanup potential markdown
    if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
    
    // Brace extraction safeguard
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString.trim());
    } catch (parseErr) {
      console.error('[Gemini Aliases] JSON parse failed:', parseErr.message, '| String was:', jsonString);
      return res.status(200).json({
        success: true,
        data: {
          consumer_number: [], units_consumed: [], total_bill: [],
          billing_period: [], due_date: [], customer_name: [],
          discom_name: [], tariff: [], consumer_type: []
        },
        warning: 'AI response could not be parsed. Please fill labels manually.'
      });
    }
    
    // Default fallback if some keys are missing
    const finalAliases = {
      consumer_number: Array.isArray(parsed.consumer_number) ? parsed.consumer_number : [],
      units_consumed: Array.isArray(parsed.units_consumed) ? parsed.units_consumed : [],
      total_bill: Array.isArray(parsed.total_bill) ? parsed.total_bill : [],
      billing_period: Array.isArray(parsed.billing_period) ? parsed.billing_period : [],
      due_date: Array.isArray(parsed.due_date) ? parsed.due_date : [],
      customer_name: Array.isArray(parsed.customer_name) ? parsed.customer_name : [],
      discom_name: Array.isArray(parsed.discom_name) ? parsed.discom_name : [],
      tariff: Array.isArray(parsed.tariff) ? parsed.tariff : [],
      consumer_type: Array.isArray(parsed.consumer_type) ? parsed.consumer_type : []
    };

    console.log('[Gemini Aliases] ✅ Success');
    res.status(200).json({ success: true, data: finalAliases });
  } catch (error) {
    console.error('Error auto-generating aliases with Gemini:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};
