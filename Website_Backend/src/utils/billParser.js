import fs from 'fs';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import { createRequire } from 'module';
import { convertScannedPdfToImages } from './Ocrextractor.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Reconstructs a table/text layout by grouping coordinates into rows.
 * @param {Array} items - Array of { text: string, x: number, y: number }
 * @param {number} yTolerance - Tolerance in pixels to group text into the same row
 */
function reconstructTableLayout(items, yTolerance = 5) {
    if (!items || items.length === 0) return "";
    
    // Sort all items strictly by Y first
    items.sort((a, b) => a.y - b.y);

    let rows = [];
    let currentRow = [items[0]];

    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        // If Y is within tolerance, it belongs to the same row
        if (Math.abs(item.y - currentRow[0].y) <= yTolerance) {
            currentRow.push(item);
        } else {
            rows.push(currentRow);
            currentRow = [item];
        }
    }
    if (currentRow.length > 0) rows.push(currentRow);

    // Now, sort each row by X (left to right) and join
    return rows.map(row => {
        row.sort((a, b) => a.x - b.x);
        return row.map(i => i.text).join('   '); // 3 spaces for column gap
    }).join('\n');
}

/**
 * Blur detection using Variance of Laplacian via Sharp
 */
async function checkImageBlur(imageBuffer) {
    try {
        const { width, height } = await sharp(imageBuffer).metadata();
        const rawPixels = await sharp(imageBuffer)
            .greyscale()
            .resize(Math.round(width/2)) // Speed up
            .convolve({
                width: 3, height: 3,
                kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
                offset: 128
            })
            .raw()
            .toBuffer();
        
        let sum = 0;
        for (let i = 0; i < rawPixels.length; i++) sum += rawPixels[i];
        const mean = sum / rawPixels.length;
        
        let varSum = 0;
        for (let i = 0; i < rawPixels.length; i++) varSum += Math.pow(rawPixels[i] - mean, 2);
        
        const variance = varSum / rawPixels.length;
        console.log(`[BlurCheck] Laplacian Variance: ${variance.toFixed(2)}`);
        
        return variance < 30; // 30 is extremely blurry
    } catch(e) {
        console.warn("Blur check failed:", e);
        return false;
    }
}

export async function extractRawText(fileBuffer, mimeType) {
    try {
        console.log(`[BillParser] Starting extraction for mimeType: ${mimeType}`);
        let rawText = "";
        let usedOCR = false;
        let isBlurry = false;
        let globalWordsWithPositions = [];

        const performAdvancedOCR = async (imageBuffer, pageIndex = 0) => {
            isBlurry = await checkImageBlur(imageBuffer);
            
            const processedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 2500, withoutEnlargement: true }) 
                .grayscale()
                .normalize()
                .linear(1.2, -(1.2 * 128) + 128)
                .sharpen({ sigma: 1, m1: 2, m2: 2, x1: 2, y2: 10, y3: 20 })
                .toBuffer();

            // English + Hindi for cross-validation
            const worker = await Tesseract.createWorker('eng+hin');
            
            // Tesseract table-aware extraction using word bounding boxes
            const { data } = await worker.recognize(processedImageBuffer);
            await worker.terminate();

            if (data && data.words) {
                const mappedWords = data.words.map(w => ({
                    text: w.text,
                    x: w.bbox.x0,
                    y: w.bbox.y0 + (pageIndex * 2000) // Offset Y by page index to prevent overlap
                }));
                globalWordsWithPositions.push(...mappedWords);
                // Tesseract lines might drift, use yTolerance of ~15 pixels
                return reconstructTableLayout(mappedWords, 15);
            }
            return data.text;
        };

        if (mimeType === 'application/pdf') {
            console.log(`[BillParser] Detected PDF. Attempting Table-Aware digital text extraction...`);
            let pageIndex = 0;
            const render_page = async (pageData) => {
                const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
                const items = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5]
                }));
                const invertedItems = items.map(i => ({...i, y: -i.y + (pageIndex * 2000)}));
                globalWordsWithPositions.push(...invertedItems);
                pageIndex++;
                return reconstructTableLayout(invertedItems, 3);
            };

            const pdfData = await pdfParse(fileBuffer, { pagerender: render_page });
            rawText = pdfData.text || "";

            if (rawText.replace(/\s+/g, '').length < 50) {
                console.log(`[BillParser] PDF text is too short. Scanned PDF fallback...`);
                globalWordsWithPositions = []; // Reset if we fallback
                const pageImages = await convertScannedPdfToImages(fileBuffer);
                if (pageImages && pageImages.length > 0) {
                    const pagesToOCR = Math.min(pageImages.length, 2);
                    for (let i = 0; i < pagesToOCR; i++) {
                        const text = await performAdvancedOCR(pageImages[i], i);
                        rawText += "\n" + text;
                    }
                    usedOCR = true;
                } else {
                    throw new Error("Could not convert PDF to images for OCR fallback.");
                }
            } else {
                console.log(`[BillParser] Table-Aware PDF extraction successful.`);
            }
        } else if (mimeType.startsWith('image/')) {
            console.log(`[BillParser] Detected Image. Starting Advanced Table-Aware OCR...`);
            rawText = await performAdvancedOCR(fileBuffer, 0);
            usedOCR = true;
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }

        // Clean up empty lines
        rawText = rawText.replace(/\n\s*\n/g, '\n');

        return { rawText, usedOCR, isBlurry, wordsWithPositions: globalWordsWithPositions };

    } catch (error) {
        console.error(`[BillParser] Failed to extract text:`, error);
        throw error;
    }
}
