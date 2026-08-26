const fs = require('fs');
const file = '../Website_Backend/src/controllers/bdeController.js';
let code = fs.readFileSync(file, 'utf8');

// Add moveLeadToOrderJourney
const moveRoute = `export const moveLeadToOrderJourney = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    lead.bdeMovedToOrderJourney = true;
    lead.history.push({ action: "BDE manually moved lead to Order Journey", date: new Date() });
    await lead.save();
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBDEProjects`;

code = code.replace(/export const getBDEProjects/, moveRoute);

const newGetBDEProjects = `export const getBDEProjects = async (req, res) => {
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

    const projects = await ProjectOrder.find(filter).sort({ createdAt: -1 }).lean();
    const Lead = (await import('../models/Lead.js')).default;
    const projectLeads = await Lead.find({ convertedProjectId: { $in: projects.map(p => p._id) } }).lean();

    const eligibleProjects = projects.filter(p => {
      const lead = projectLeads.find(l => l.convertedProjectId?.toString() === p._id.toString());
      if (!lead) return true; // If no lead found, just show it
      
      const isAU = lead.country === 'australia' || lead.country === 'AU';
      if (isAU) {
        return lead.bdeMovedToOrderJourney;
      } else {
        return lead.tokenPaid && lead.assignedEPCId;
      }
    });

    res.json({ success: true, projects: eligibleProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }`;

code = code.replace(/export const getBDEProjects[\s\S]*?res\.status\(500\)\.json\(\{ success: false, message: error\.message \}\);\s*\}/, newGetBDEProjects);

fs.writeFileSync(file, code);
console.log('Restored bdeController.js');
