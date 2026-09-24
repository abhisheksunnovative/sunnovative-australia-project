const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const importScanAnalytics = "import ScanAnalytics from '../models/ScanAnalytics.js';\n";
if (!code.includes("import ScanAnalytics from '../models/ScanAnalytics.js'")) {
    code = importScanAnalytics + code;
}

const resolveLogic = `    const template = await BillTemplate.findOneAndUpdate(
      { country: req.body.country, discomName: req.body.discomName },
      { $set: req.body },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    
    if (req.body.sourceScanAnalyticsId) {
      await ScanAnalytics.findByIdAndUpdate(req.body.sourceScanAnalyticsId, {
        resolvedTemplateId: template._id
      });
    }`;

code = code.replace(/const template = await BillTemplate\.findOneAndUpdate\([\s\S]*?setDefaultsOnInsert: true \}\n    \);/, resolveLogic);

fs.writeFileSync(path, code);
console.log("Added sourceScanAnalyticsId resolution to createTemplate.");
