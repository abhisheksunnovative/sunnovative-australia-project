const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

// Replace import
code = code.replace(
    "import { extractPdfText } from '../utils/Ocrextractor.js';",
    "import { extractRawText } from '../utils/billParser.js';"
);

// Replace extractPdfText call in autoGenerateAliases
const oldExtractCall = `        try {
          const { text, isScanned } = await extractPdfText(req.file.buffer);
          extractedRawText = text;
          if (!isScanned) {`;

const newExtractCall = `        try {
          const { rawText, usedOCR } = await extractRawText(req.file.buffer, req.file.mimetype);
          extractedRawText = rawText;
          if (!usedOCR) {`;

code = code.replace(oldExtractCall, newExtractCall);

fs.writeFileSync(path, code);
console.log("Replaced extractPdfText with extractRawText to unify parsing.");
