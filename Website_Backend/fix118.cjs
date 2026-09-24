const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const target = `        const totalScans = await ScanAnalytics.countDocuments();
        
        res.status(200).json({ success: true, stats, reasons, totalScans });`;

const replacement = `        const totalScans = await ScanAnalytics.countDocuments();
        const templateMatched = await ScanAnalytics.countDocuments({ engineUsed: { $ne: 'in-house-failed' } });
        const coveragePercent = totalScans > 0 ? ((templateMatched / totalScans) * 100).toFixed(1) : 0;
        
        res.status(200).json({ success: true, stats, reasons, totalScans, coveragePercent });`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log("Added coveragePercent to getScanAnalytics.");
