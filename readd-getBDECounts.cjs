const fs = require('fs');

const path = 'Website_Backend/src/controllers/bdeController.js';
let content = fs.readFileSync(path, 'utf8');

const getBDECountsLogic = `
export const getBDECounts = async (req, res) => {
  try {
    const { bdeId } = req.params;
    
    const [leadsCount, prospectsCount, customersCount] = await Promise.all([
      Lead.countDocuments({ assignedBde: bdeId, installDateBooked: { $ne: true } }),
      Lead.countDocuments({ assignedBde: bdeId, installDateBooked: true, convertedProjectId: { $exists: false } }),
      Lead.countDocuments({ assignedBde: bdeId, convertedProjectId: { $exists: true } })
    ]);
    
    res.json({
      success: true,
      data: {
        leads: leadsCount,
        prospects: prospectsCount,
        customers: customersCount
      }
    });
  } catch (err) {
    console.error('getBDECounts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
`;

if (!content.includes('export const getBDECounts')) {
  content += '\n' + getBDECountsLogic;
  fs.writeFileSync(path, content);
}
