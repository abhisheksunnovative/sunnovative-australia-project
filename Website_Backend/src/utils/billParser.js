import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import { createRequire } from 'module';
import { convertScannedPdfToImages } from './Ocrextractor.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractRawText(fileBuffer, mimeType) {
    try {
        console.log(`[BillParser] Starting extraction for mimeType: ${mimeType}`);
        let rawText = "";
        let usedOCR = false;

        const performAdvancedOCR = async (imageBuffer) => {
            // Advanced CamScanner-like Image Preprocessing
            // This upscales, sharpens, and increases contrast heavily to make text pop for Tesseract
            const processedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 2500, withoutEnlargement: false }) 
                .grayscale()
                .normalize()
                .linear(1.2, -(1.2 * 128) + 128) // High contrast push
                .sharpen({ sigma: 1, m1: 2, m2: 2, x1: 2, y2: 10, y3: 20 }) // Advanced sharpening
                .toBuffer();

            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(processedImageBuffer);
            await worker.terminate();
            return text;
        };

        if (mimeType === 'application/pdf') {
            console.log(`[BillParser] Detected PDF. Attempting digital text extraction...`);
            const pdfData = await pdfParse(fileBuffer);
            rawText = pdfData.text || "";

            if (rawText.trim().length < 50) {
                console.log(`[BillParser] PDF text is too short. It's likely a scanned image inside a PDF. Falling back to Advanced OCR.`);
                
                const pageImages = await convertScannedPdfToImages(fileBuffer);
                if (pageImages && pageImages.length > 0) {
                    console.log(`[BillParser] PDF converted to ${pageImages.length} images. OCRing the first 2 pages...`);
                    const pagesToOCR = Math.min(pageImages.length, 2);
                    for (let i = 0; i < pagesToOCR; i++) {
                        const text = await performAdvancedOCR(pageImages[i]);
                        rawText += "\n" + text;
                    }
                    usedOCR = true;
                    console.log(`[BillParser] Advanced OCR fallback successful. Extracted ${rawText.length} chars.`);
                } else {
                    throw new Error("Could not convert PDF to images for OCR fallback.");
                }

            } else {
                console.log(`[BillParser] Digital PDF extraction successful. Extracted ${rawText.length} chars.`);
            }
        } else if (mimeType.startsWith('image/')) {
            console.log(`[BillParser] Detected Image. Starting Advanced Pre-processing + OCR...`);
            rawText = await performAdvancedOCR(fileBuffer);
            usedOCR = true;
            console.log(`[BillParser] Advanced OCR successful. Extracted ${rawText.length} chars.`);
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }

        rawText = rawText.replace(/\r\n/g, '\n').replace(/[^\S\n]+/g, ' '); 

        return { rawText, usedOCR };

    } catch (error) {
        console.error(`[BillParser] Failed to extract text:`, error);
        throw error;
    }
}
