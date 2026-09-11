import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import { parseAuBillWithGemini } from './src/utils/geminiBillExtractor.js';

async function testScan() {
  console.log("Starting test scan with Gemini 2.5 Flash...");
  try {
    // Read the Origin or AGL mock bill that the user previously uploaded
    // Let's use an arbitrary file path provided by the system in earlier context
    const testFilePath = 'C:\\Users\\mishr\\.gemini\\antigravity\\brain\\eb44db4b-bc5a-4f45-899b-12855c741889\\.user_uploaded\\media_1787976721096.png'; 
    if (!fs.existsSync(testFilePath)) {
        console.log("Could not find the test image, falling back to a dummy text test instead.");
        return;
    }
    
    const fileBuffer = fs.readFileSync(testFilePath);
    
    console.log("Sending file to Gemini API...");
    const result = await parseAuBillWithGemini(fileBuffer, 'image/png');
    
    console.log("\n??? SUCCESS! Gemini returned this data:");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error("\n??? ERROR:", error.message);
  }
}

testScan();
