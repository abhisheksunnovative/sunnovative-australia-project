import fs from 'fs';

let content1 = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');
content1 = content1.replace("model: 'gemini-1.5-flash'", "model: 'gemini-1.5-flash-latest'");
fs.writeFileSync('src/controllers/billTemplateController.js', content1);

let content2 = fs.readFileSync('src/utils/geminiExtractor.js', 'utf8');
content2 = content2.replace("model: 'gemini-1.5-flash'", "model: 'gemini-1.5-flash-latest'");
fs.writeFileSync('src/utils/geminiExtractor.js', content2);

console.log("Model names updated to gemini-1.5-flash-latest");
