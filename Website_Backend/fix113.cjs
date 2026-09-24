const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const oldBlock = `            if (isAU) {
                // AU/NZ Handle: Parser bugs on Digital PDFs
                engineUsed = 'in-house-failed';
                fallbackReason = 'Critical fields missing on AU bill (Likely Parser Bug)';
                console.warn("[BillScan] AU Bill failed critical check. Logging as parser bug. No Gemini fallback.");
            } else {`;

const newBlock = `            if (isAU) {
                // AU/NZ Handle: Parser bugs on Digital PDFs
                engineUsed = 'in-house-failed';
                fallbackReason = 'Critical fields missing on AU bill (Likely Parser Bug)';
                needsTemplate = true; // Mark for Admin Review Queue
                console.warn("[BillScan] AU Bill failed critical check. Flagged for template review.");
            } else {`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync(path, code);
console.log("Added needsTemplate=true for AU failures.");
