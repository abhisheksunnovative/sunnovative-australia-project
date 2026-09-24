const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/routes/lightBillScanRoutes.js';
let code = fs.readFileSync(path, 'utf8');

// Add import
code = code.replace(
    "import { scanLightBill, getScanAnalytics } from '../controllers/lightBillScanController.js';",
    "import { scanLightBill, getScanAnalytics, getNeedsTemplateQueue } from '../controllers/lightBillScanController.js';"
);

// Add route
code = code.replace(
    "router.get('/analytics', getScanAnalytics);",
    "router.get('/analytics', getScanAnalytics);\nrouter.get('/needs-review', getNeedsTemplateQueue);"
);

fs.writeFileSync(path, code);
console.log("Added needs-review route.");
