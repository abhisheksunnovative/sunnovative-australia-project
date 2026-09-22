import fs from 'fs';
import { extractRawText } from './src/utils/billParser.js';

async function run() {
    console.log("Running layout test...");
    const filePath = 'C:/Users/mishr/.gemini/antigravity/brain/01505a13-b0bf-4a3d-aa98-b8da2981fce5/.user_uploaded/media_1790058869132.pdf'; // BSES Yamuna digital PDF
    const buf = fs.readFileSync(filePath);
    const result = await extractRawText(buf, 'application/pdf');
    fs.writeFileSync('layout_test.txt', result.rawText);
    console.log("Wrote layout_test.txt");
}
run();
