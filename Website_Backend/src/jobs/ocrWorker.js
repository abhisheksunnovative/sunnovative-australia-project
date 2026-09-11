import { Worker } from 'bullmq';
import { BillExtraction } from '../models/BillExtraction.js';
import { BillTemplate } from '../models/BillTemplate.js';
import { runOcr, parseBillText } from '../utils/Ocrextractor.js';
import { matchTemplate } from '../utils/TemplateMatcher.js';
import { validateExtraction } from '../utils/ValidationEngine.js';
import fs from 'fs';

export const startOcrWorker = () => {
  new Worker('bill-ocr-queue', async job => {
    const { extractionId, filePath } = job.data;
    
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
      
      // 4. Fallback to Old V1 Regex if V2 Template failed to extract core fields
      if (!extracted.units_consumed && !extracted.total_bill) {
        console.log(`[Job ${job.id}] V2 Template matching failed/empty. Falling back to V1 Regex...`);
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
      
      // 4. Validate
      const validation = validateExtraction(extracted);
      
      // 5. Update DB
      await BillExtraction.findByIdAndUpdate(extractionId, {
        status: validation.status === 'PASS' ? 'COMPLETED' : 'COMPLETED', // Or manual review status
        raw_text: rawText,
        normalized_data_json: extracted,
        confidence: validation.confidence,
        validation_results_json: validation
      });
      
    } catch (err) {
      console.error(err);
      await BillExtraction.findByIdAndUpdate(extractionId, { status: 'FAILED', error_message: err.message });
    }
  }, {
    connection: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT || 6379 }
  });
};
