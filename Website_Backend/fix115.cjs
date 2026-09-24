const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let code = fs.readFileSync(path, 'utf8');

const newQueueFunc = `
export const getNeedsTemplateQueue = async (req, res) => {
    try {
        const { country } = req.query;
        const query = {
            needsTemplateCreation: true,
            resolvedTemplateId: null
        };
        if (country) query.country = country;
        
        const items = await ScanAnalytics.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json({ success: true, count: items.length, items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
`;

if (!code.includes('getNeedsTemplateQueue')) {
    code += newQueueFunc;
    fs.writeFileSync(path, code);
    console.log("Added getNeedsTemplateQueue to lightBillScanController.");
}
