import fs from 'fs';
import { BillExtraction } from '../models/BillExtraction.js';
import { addBillToQueue } from '../jobs/ocrQueue.js';

export const scanLightBillV2 = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a bill image or PDF.' });
    
    const ext = req.file.originalname.split('.').pop();
    const filename = `bill-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const dir = './uploads/bills_v2';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filePath = dir + '/' + filename;
    fs.writeFileSync(filePath, req.file.buffer);
    
    const extraction = await BillExtraction.create({
      job_id: `job-${Date.now()}`,
      status: 'PENDING',
      bill_document_uri: filePath,
      mime_type: req.file.mimetype
    });
    
    await addBillToQueue({ extractionId: extraction._id, filePath });
    
    return res.status(202).json({
      message: 'Bill uploaded successfully. OCR is running in background.',
      extraction_id: extraction._id,
      job_id: extraction.job_id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
