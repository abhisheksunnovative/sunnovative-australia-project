import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const oldCode = `        // Fallback removed as per user request (no guess-multiply for low kWh)

        // Recommendation Safety Gate - Critical Fields Check`;
        
const newCode = `        // Fallback removed as per user request (no guess-multiply for low kWh)
        let finalKwh = merged.quarterlyKwh;

        // Recommendation Safety Gate - Critical Fields Check`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/controllers/lightBillScanController.js', content);
console.log("Restored finalKwh definition");
