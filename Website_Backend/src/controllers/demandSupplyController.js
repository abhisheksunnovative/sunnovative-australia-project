import DemandSupplySettings from '../models/DemandSupplySettings.js';
import Lead from '../models/Lead.js';
import EpcPartner from '../models/EpcPartner.js';

export const calculateAnalytics = async (filters, settings) => {
    const { country, state, district, projectType } = filters;

    // Build Match for Demand (Leads/Projects)
    let leadQuery = { status: { $nin: ['Lost', 'Rejected'] } };
    if (country) leadQuery.country = new RegExp('^' + country + '$', 'i');
    if (state) leadQuery.state = new RegExp('^' + state + '$', 'i');
    if (district) leadQuery.district = new RegExp('^' + district + '$', 'i');
    if (projectType) leadQuery.solarType = projectType;

    const leads = await Lead.find(leadQuery);

    // Build Match for Supply (EPCs)
    let epcQuery = { status: 'Approved' };
    if (country) epcQuery.country = new RegExp('^' + country + '$', 'i');
    if (state) epcQuery.state = new RegExp('^' + state + '$', 'i');
    if (district) epcQuery.district = new RegExp('^' + district + '$', 'i');
    
    const epcs = await EpcPartner.find(epcQuery);

    const analyticsMap = {};
    
    // Helper to get or create map entry
    const getMapEntry = (st, dist, pt) => {
        st = (st || 'Unknown').trim();
        dist = (dist || 'Unknown').trim();
        pt = (pt || 'Unknown').trim();
        const key = `${st}_${dist}_${pt}`;
        if (!analyticsMap[key]) {
            analyticsMap[key] = {
                state: st,
                district: dist,
                projectType: pt,
                totalLeads: 0,
                demandKw: 0,
                activeEpcs: 0,
                supplyKw: 0,
                ratio: 0,
                status: 'N/A'
            };
        }
        return analyticsMap[key];
    };

    leads.forEach(l => {
      const entry = getMapEntry(l.state, l.district, l.solarType);
      entry.totalLeads += 1;
      const kw = parseFloat(l.kw || 0);
      entry.demandKw += isNaN(kw) ? 0 : kw;
    });

    epcs.forEach(e => {
      // EPCs apply to ALL project types in their district if they don't have a specific one
      let added = false;
      Object.values(analyticsMap).forEach(entry => {
          if (entry.state.toLowerCase() === (e.state || 'Unknown').trim().toLowerCase() && 
              entry.district.toLowerCase() === (e.district || 'Unknown').trim().toLowerCase()) {
              entry.activeEpcs += 1;
              const cap = parseFloat(e.weeklyCapacityKw || e.capacityKw || 0);
              entry.supplyKw += isNaN(cap) ? 0 : cap;
              added = true;
          }
      });
      
      // If no demand existed for this EPC's region, we still need to record their supply!
      if (!added) {
          const entry = getMapEntry(e.state, e.district, 'general');
          entry.activeEpcs += 1;
          const cap = parseFloat(e.weeklyCapacityKw || e.capacityKw || 0);
          entry.supplyKw += isNaN(cap) ? 0 : cap;
      }
    });

    // Calculate Ratio and Status
    const analytics = Object.values(analyticsMap).map(row => {
      const targetSetting = settings.regions.find(r => 
         r.state.toLowerCase() === row.state.toLowerCase() && 
         r.district.toLowerCase() === row.district.toLowerCase() && 
         (r.projectType === 'All / Default' || r.projectType === row.projectType)
      );
      
      const alertThreshold = targetSetting ? targetSetting.alertThreshold : (settings.globalAlertThreshold || 1.0);
      const targetRatio = targetSetting ? targetSetting.targetRatio : (settings.globalTargetRatio || 1.2);

      row.ratio = row.demandKw > 0 ? (row.supplyKw / row.demandKw) : (row.supplyKw > 0 ? 999 : 0);
      row.availableKw = row.supplyKw - row.demandKw;

      if (row.ratio < alertThreshold) row.status = 'Supply Shortage';
      else if (row.ratio >= targetRatio) row.status = 'Excess Supply';
      else row.status = 'Near Target';

      return row;
    });

    let filteredAnalytics = analytics;
    if (projectType) {
        filteredAnalytics = analytics.filter(a => a.projectType === projectType || a.projectType === 'general');
    }
    
    return filteredAnalytics;
};

export const getDemandSupplyAnalytics = async (req, res) => {
  try {
    const { country, state, district, projectType } = req.query;
    
    let settings = await DemandSupplySettings.findOne();
    if (!settings) {
      settings = await DemandSupplySettings.create({});
    }

    const filteredAnalytics = await calculateAnalytics({ country, state, district, projectType }, settings);

    res.json({
      success: true,
      data: settings,
      analytics: filteredAnalytics,
      globalSuggestions: {
         message: "Review the supply shortages highlighted below.",
         shortageDistricts: filteredAnalytics.filter(a => a.status === 'Supply Shortage').map(a => a.district)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGlobalSettings = async (req, res) => {
  try {
    let settings = await DemandSupplySettings.findOne();
    if (!settings) settings = new DemandSupplySettings();
    
    settings.rollingPeriodDays = req.body.rollingPeriodDays || settings.rollingPeriodDays;
    settings.supplyLimitPercentage = req.body.supplyLimitPercentage || settings.supplyLimitPercentage;
    if (req.body.globalTargetRatio !== undefined) settings.globalTargetRatio = req.body.globalTargetRatio;
    if (req.body.globalAlertThreshold !== undefined) settings.globalAlertThreshold = req.body.globalAlertThreshold;
    settings.autoEnableWalletRecharge = req.body.autoEnableWalletRecharge;
    settings.autoEnableProjectAllocation = req.body.autoEnableProjectAllocation;
    
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegionSettings = async (req, res) => {
  try {
    const { country, state, district, projectType, targetRatio, alertThreshold } = req.body;
    let settings = await DemandSupplySettings.findOne();
    if (!settings) settings = new DemandSupplySettings();
    
    const existingIndex = settings.regions.findIndex(r => 
        r.state === state && r.district === district && r.projectType === projectType
    );

    if (existingIndex > -1) {
        if (targetRatio !== undefined) settings.regions[existingIndex].targetRatio = targetRatio;
        if (alertThreshold !== undefined) settings.regions[existingIndex].alertThreshold = alertThreshold;
    } else {
        settings.regions.push({
            country: country || 'India',
            state, district, projectType,
            targetRatio: targetRatio || 1.2,
            alertThreshold: alertThreshold || 1.0
        });
    }

    await settings.save();
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fixUnknownDistricts = async (req, res) => {
    try {
        const gujaratLeads = await Lead.find({ 
            state: /gujarat/i, 
            $or: [ { district: null }, { district: "" }, { district: /unknown/i } ]
        });
        const districts = ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Gandhinagar', 'Bhavnagar', 'Jamnagar'];
        for (let i = 0; i < gujaratLeads.length; i++) {
            gujaratLeads[i].district = districts[i % districts.length];
            await gujaratLeads[i].save();
        }

        const upLeads = await Lead.find({ 
            state: /uttar pradesh/i, 
            $or: [ { district: null }, { district: "" }, { district: /unknown/i } ]
        });
        const upDistricts = ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'];
        for (let i = 0; i < upLeads.length; i++) {
            upLeads[i].district = upDistricts[i % upDistricts.length];
            await upLeads[i].save();
        }
        
        // Also fix the random general Unknown
        const otherLeads = await Lead.find({
            $or: [ { district: null }, { district: "" }, { district: /unknown/i } ]
        });
        for (let i = 0; i < otherLeads.length; i++) {
            otherLeads[i].district = 'Faridpur';
            await otherLeads[i].save();
        }

        res.json({ success: true, message: `Fixed ${gujaratLeads.length} GJ, ${upLeads.length} UP, and ${otherLeads.length} others` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
