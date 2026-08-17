import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { scanBillWithGemini } from './src/utils/aiVisionExtractor.js';

async function test() {
  try {
    // Check if api key is loaded
    console.log("API Key loaded?", process.env.GEMINI_API_KEY ? "Yes" : "No");

    // create a dummy image buffer (or pdf)
    // we don't have an image, let's just pass a tiny transparent gif or something
    const dummyImage = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

    console.log("Running Gemini scan...");
    const result = await scanBillWithGemini(dummyImage, 'image/gif', 'india');
    console.log("Result:", result);
  } catch (err) {
    console.error("Test Error:", err);
  }
}
test();
