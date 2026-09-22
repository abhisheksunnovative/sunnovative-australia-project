import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import { convertScannedPdfToImages } from './src/utils/Ocrextractor.js';

async function testExtraction() {
    const filePath = 'C:/Users/mishr/.gemini/antigravity/brain/01505a13-b0bf-4a3d-aa98-b8da2981fce5/.user_uploaded/media_1790057397858.pdf';
    
    console.log("Extracting with Heavy Preprocessing...");
    const fileBuffer = fs.readFileSync(filePath);
    
    try {
        const pageImages = await convertScannedPdfToImages(fileBuffer);
        
        let rawText = "";
        for (let i = 0; i < Math.min(pageImages.length, 2); i++) {
            // Apply Heavy CamScanner-like processing
            const processedImageBuffer = await sharp(pageImages[i])
                // Increase resolution if it's small, gives Tesseract more pixels to read
                .resize({ width: 2500, withoutEnlargement: false }) 
                .grayscale()
                .normalize()
                .linear(1.2, -(1.2 * 128) + 128) // High contrast
                .sharpen()
                .toBuffer();
            
            const worker = await Tesseract.createWorker('eng');
            const { data: { text } } = await worker.recognize(processedImageBuffer);
            await worker.terminate();
            
            rawText += "\n" + text;
        }
        
        fs.writeFileSync('synergy_ocr_heavy.txt', rawText);
        console.log("Done! Wrote to synergy_ocr_heavy.txt");
    } catch (e) {
        console.error("Failed:", e);
    }
}
testExtraction();
