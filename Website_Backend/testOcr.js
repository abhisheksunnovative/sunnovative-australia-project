import fs from 'fs';
import { extractRawText } from './src/utils/billParser.js';

async function testExtraction() {
    const filePath = 'C:/Users/mishr/.gemini/antigravity/brain/01505a13-b0bf-4a3d-aa98-b8da2981fce5/.user_uploaded/media_1790057397858.pdf';
    
    console.log("Extracting...");
    const fileBuffer = fs.readFileSync(filePath);
    
    try {
        const { rawText } = await extractRawText(fileBuffer, 'application/pdf');
        fs.writeFileSync('synergy_ocr.txt', rawText);
        console.log("Done! Wrote to synergy_ocr.txt");
    } catch (e) {
        console.error("Failed:", e);
    }
}
testExtraction();
