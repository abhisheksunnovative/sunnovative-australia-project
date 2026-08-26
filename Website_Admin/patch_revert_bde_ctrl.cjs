const fs = require('fs');
const file = '../Website_Backend/src/controllers/bdeController.js';
let code = fs.readFileSync(file, 'utf8');

// Remove moveLeadToOrderJourney
code = code.replace(/export const moveLeadToOrderJourney[\s\S]*?catch \(error\) \{\s*res\.status\(400\)\.json\(\{ success: false, message: error\.message \}\);\s*\}\s*\};\s*/, '');

// Restore getBDEProjects
code = code.replace(/export const getBDEProjects[\s\S]*?res\.status\(500\)\.json\(\{ success: false, message: error\.message \}\);\s*\}/, `export const getBDEProjects = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const { country, state, district, projectType, search, status } = req.query;

    let filter = { assignedBde: bdeId };
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (projectType) filter.projectType = projectType;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await ProjectOrder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }`);

fs.writeFileSync(file, code);
console.log('Reverted bdeController.js');
