const fs = require('fs');

// 1. Update bdeController.js
let bdeController = fs.readFileSync('src/controllers/bdeController.js', 'utf8');
const countsFunction = `
export const getBDECounts = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const bde = await BDE.findById(bdeId);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });

    const isFreelance = bde.bdeType?.toLowerCase().includes("freelance");
    let leadsCount = 0;
    let prospectsCount = 0;
    let eligibilityCount = 0;
    let projectsCount = 0;
    let demandCount = 0;

    // Fast lean query
    const leads = await Lead.find({ assignedBde: bdeId }, { status: 1, history: 1, isEligibleForInstallation: 1, installDateBooked: 1, bdeMovedToOrderJourney: 1 }).lean();
    
    leads.forEach(l => {
      const isManual = l.history?.some(h => h.action.includes("Manually created by BDE"));
      const isTargetSource = isFreelance ? isManual : !isManual;
      if (!isTargetSource) return;
      if (['Converted', 'Not Interested', 'Lost'].includes(l.status) || l.bdeMovedToOrderJourney) return;

      if (l.status === "RAW" && isFreelance) {
        leadsCount++;
        return;
      }
      const isInOrderJourney = l.bdeMovedToOrderJourney;
      if (isFreelance) {
        if (l.isEligibleForInstallation || l.installDateBooked) {
          if (!isInOrderJourney) prospectsCount++;
        } else {
          eligibilityCount++;
        }
      } else {
        if (!isInOrderJourney) prospectsCount++;
      }
    });

    const { ProjectOrder } = await import('../models/ProjectModel.js');
    projectsCount = await ProjectOrder.countDocuments({ assignedBde: bdeId });

    if (!isFreelance) {
      let bdeCountries = bde.assignedCountries || [];
      if (bdeCountries.length === 0 && bde.country) bdeCountries = [bde.country];
      if (bdeCountries.length === 0) bdeCountries = ['australia', 'india'];

      const countryConditions = bdeCountries.map(c => {
        const code = c.trim().toLowerCase();
        if (code === 'australia' || code === 'au') return { country: { $regex: /australia|au/i } };
        if (code === 'india' || code === 'in') return { country: { $regex: /india|in/i } };
        return { country: { $regex: new RegExp(code, 'i') } };
      });

      const activeTerritories = [
        ...(bde.region ? [bde.region] : []),
        ...(bde.assignedRegions || []),
        ...(bde.assignedDistricts || []),
        ...(bde.assignedStates || [])
      ].filter(t => t && t.trim() && t.trim().toLowerCase() !== 'all' && t.trim().toLowerCase() !== 'unassigned');

      let andConditions = [{ assignedBde: null }];
      if (countryConditions.length > 0) andConditions.push({ $or: countryConditions });
      if (activeTerritories.length > 0) {
        const terrRegexes = activeTerritories.map(t => new RegExp(t.trim(), 'i'));
        andConditions.push({
          $or: [
            { district: { $in: terrRegexes } },
            { city: { $in: terrRegexes } },
            { state: { $in: terrRegexes } },
            { pincode: { $in: terrRegexes } },
            { address: { $in: terrRegexes } }
          ]
        });
      }
      const unassignedQuery = andConditions.length > 1 ? { $and: andConditions } : { assignedBde: null };
      const query = { $or: [ unassignedQuery, { assignedBde: bdeId, status: 'assigned to bde' } ] };
      demandCount = await Lead.countDocuments(query);
    }

    res.json({ success: true, counts: { eligibility: eligibilityCount, myleads: leadsCount, prospects: prospectsCount, projects: projectsCount, demand: demandCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
bdeController = bdeController + '\\n' + countsFunction;
fs.writeFileSync('src/controllers/bdeController.js', bdeController);

// 2. Update bdeRoutes.js
let bdeRoutes = fs.readFileSync('src/routes/bdeRoutes.js', 'utf8');
bdeRoutes = bdeRoutes.replace(/import \{/, 'import { getBDECounts, ');
bdeRoutes = bdeRoutes.replace('router.get("/:bdeId/dashboard", getBDEDashboard);', 'router.get("/:bdeId/dashboard", getBDEDashboard);\nrouter.get("/:bdeId/counts", getBDECounts);');
fs.writeFileSync('src/routes/bdeRoutes.js', bdeRoutes);
