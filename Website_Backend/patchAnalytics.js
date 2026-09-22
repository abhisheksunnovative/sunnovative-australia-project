import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

// Add getScanAnalytics endpoint
const analyticsLogic = `
export const getScanAnalytics = async (req, res) => {
    try {
        const stats = await ScanAnalytics.aggregate([
            {
                $group: {
                    _id: "$engineUsed",
                    count: { $sum: 1 },
                    totalCost: { $sum: "$geminiEstimatedCost" }
                }
            }
        ]);

        const reasons = await ScanAnalytics.aggregate([
            { $match: { fallbackReason: { $ne: null } } },
            {
                $group: {
                    _id: "$fallbackReason",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const totalScans = await ScanAnalytics.countDocuments();
        
        res.status(200).json({ success: true, stats, reasons, totalScans });
    } catch (err) {
        console.error("[BillScan] Analytics Error:", err);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
};
`;

content += analyticsLogic;
fs.writeFileSync('src/controllers/lightBillScanController.js', content);

// Update routes
let routesContent = fs.readFileSync('src/routes/lightBillScanRoutes.js', 'utf8');
routesContent = routesContent.replace(
    "import { scanLightBill } from '../controllers/lightBillScanController.js';",
    "import { scanLightBill, getScanAnalytics } from '../controllers/lightBillScanController.js';"
);
routesContent = routesContent.replace(
    "export default router;",
    "router.get('/analytics', getScanAnalytics);\n\nexport default router;"
);
fs.writeFileSync('src/routes/lightBillScanRoutes.js', routesContent);

console.log("Analytics backend updated.");
