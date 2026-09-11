/**
 * ocrQueue.js — Redis-free inline queue fallback
 * 
 * Since Redis is not installed on this machine, we process OCR jobs 
 * directly (inline/async) instead of queuing them via BullMQ.
 * This is safe for development and small-scale production use.
 */

import { BillExtraction } from '../models/BillExtraction.js';
import { BillTemplate } from '../models/BillTemplate.js';
import { runOcr, parseBillText } from '../utils/Ocrextractor.js';
import { matchTemplate } from '../utils/TemplateMatcher.js';
import { validateExtraction } from '../utils/ValidationEngine.js';
import fs from 'fs';

// Process OCR job directly without Redis/BullMQ
const processOcrJob = async ({ extractionId, filePath }) => {
  try {
    await BillExtraction.findByIdAndUpdate(extractionId, { status: 'PROCESSING' });

    // 1. Run OCR
    const fileBuffer = fs.readFileSync(filePath);
    const rawText = await runOcr(fileBuffer);

    // 2. Fetch Active Template
    const template = await BillTemplate.findOne({ active: true });

    // 3. Match Template
    let extracted = {};
    if (template && Object.keys(template.OCR_aliases_json || {}).length > 0) {
      const matchResult = matchTemplate(rawText, template);
      extracted = matchResult.extracted;
    }

    // 4. Fallback to V1 Regex if template failed
    if (!extracted.units_consumed && !extracted.total_bill) {
      console.log('[OCR] Template matching failed/empty. Falling back to V1 Regex...');
      const v1Result = parseBillText(rawText);
      extracted = {
        consumer_number: v1Result.consumerNumber,
        units_consumed: v1Result.units,
        total_bill: v1Result.billAmount,
        tariff_category: v1Result.tariffCode,
        consumer_type: v1Result.meterCategory,
        discom_name: v1Result.discom,
        fallback_v1_used: true
      };
    }

    // 5. Validate
    const validation = validateExtraction(extracted);

    // 6. Update DB
    await BillExtraction.findByIdAndUpdate(extractionId, {
      status: 'COMPLETED',
      raw_text: rawText,
      normalized_data_json: extracted,
      confidence: validation.confidence,
      validation_results_json: validation
    });

    console.log(`[OCR] Job complete for extraction: ${extractionId}`);
  } catch (err) {
    console.error('[OCR] Job failed:', err.message);
    await BillExtraction.findByIdAndUpdate(extractionId, {
      status: 'FAILED',
      error_message: err.message
    });
  }
};

// Drop-in replacement for addBillToQueue — runs inline async (no Redis needed)
export const addBillToQueue = async (jobData) => {
  console.log('[OCR] Processing inline (no Redis/BullMQ required)...');
  // Fire and forget — non-blocking
  processOcrJob(jobData).catch(err => console.error('[OCR] Inline processing error:', err));
  return { id: `inline-${Date.now()}` };
};
