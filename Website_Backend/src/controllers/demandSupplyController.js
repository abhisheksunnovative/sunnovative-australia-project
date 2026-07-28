import DemandSupplySettings from "../models/DemandSupplySettings.js";
import Lead from "../models/Lead.js";
import EpcWallet from "../models/EpcWallet.js";

const mapSolarTypeToProjectType = (solarType) => {
  switch (solarType) {
    case 'surya-ghar': return 'Surya Ghar Yojana';
    case 'group-solar': return 'Group Solar';
    case 'rwa-society': return 'RWA Society';
    case 'village': return 'Village Solar Campaign';
    case 'commercial': return 'Commercial Solar';
    case 'msme': return 'MSME Solar';
    case 'residential-solar': return 'Residential Solar';
    case 'au-small-home': return 'AU Small Home (6.6kW)';
    case 'au-standard-family': return 'AU Standard Family (8-10kW)';
    case 'au-large-home': return 'AU Large Home (10-13kW)';
    case 'au-ev-owners': return 'AU EV Owners (13-20kW)';
    case 'au-solar-battery': return 'AU Solar + Battery';
    case 'general': return 'General';
    default: return 'Surya Ghar Yojana';
  }
};

const calculateAnalytics = async (filters, settings) => {
  const { country, state, district, projectType, startDate, endDate } = filters;
  const rollingPeriodDays = settings.rollingPeriodDays || 7;
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - rollingPeriodDays);

  if (startDate) fromDate = new Date(startDate);
  let toDate = endDate ? new Date(endDate) : new Date();

  // 1. Get Demand (Lead KW) in the window
  const leadQuery = { createdAt: { $gte: fromDate, $lte: toDate } };
  if (state) leadQuery.state = state;
  if (district) leadQuery.district = district;
  if (projectType) {
    leadQuery.solarType = { $regex: projectType.split(' ')[0].toLowerCase(), $options: 'i' };
  }
  const leads = await Lead.find(leadQuery);
  
  // 2. Get Supply (Wallet Transactions)
  const wallets = await EpcWallet.find({});
  
  const analyticsMap = {}; 

  const getRegionKey = (d, pt) => `${d}|${pt}`;
  const initRegion = (dist, pt) => {
    const key = getRegionKey(dist, pt);
    if (!analyticsMap[key]) {
      analyticsMap[key] = { 
        district: dist, 
        projectType: pt, 
        demandKw: 0, 
        supplyKw: 0, 
        pendingOrders: 0,
        waitingOrders: 0 
      };
    }
    return analyticsMap[key];
  };

  if (settings.regions && settings.regions.length > 0) {
    for (const r of settings.regions) {
      if (district && r.district !== district) continue;
      if (projectType && r.projectType !== projectType) continue;
      initRegion(r.district, r.projectType);
    }
  }

  for (const lead of leads) {
    if (!lead.district) continue;
    const d = lead.district.trim();
    const pt = mapSolarTypeToProjectType(lead.solarType);
    
    const region = initRegion(d, pt);
    region.demandKw += Number(lead.kw || 0);
    
    if (lead.stage === 'New' || lead.stage === 'Contacted') region.pendingOrders += 1;
    if (lead.stage === 'Negotiation') region.waitingOrders += 1;
  }

  for (const wallet of wallets) {
    for (const tx of wallet.transactions) {
      if (tx.createdAt >= fromDate && tx.createdAt <= toDate && tx.type === 'PURCHASE') {
        const d = tx.district || 'Unknown';
        const pt = tx.projectType || 'Surya Ghar Yojana';
        
        if (district && d !== district) continue;
        if (projectType && pt !== projectType) continue;

        const region = initRegion(d, pt);
        region.supplyKw += tx.kw;
      }
    }
  }

  const analyticsArray = Object.values(analyticsMap).map(row => {
    const matchPercent = row.demandKw > 0 ? ((row.supplyKw / row.demandKw) * 100).toFixed(1) : "0.0";
    const utilization = Math.min(Number(matchPercent), 100);
    const days = (toDate - fromDate) / (1000 * 60 * 60 * 24) || 1;
    const demandForecast = (row.demandKw / days) * 30;
    const supplyForecast = (row.supplyKw / days) * 30;

    const overrideConf = settings.regions.find(r => r.district === row.district && r.projectType === row.projectType);

    return {
      ...row,
      matchPercent,
      utilization,
      demandForecast: demandForecast.toFixed(2),
      supplyForecast: supplyForecast.toFixed(2),
      isPaused: overrideConf ? overrideConf.isAcceptancePaused : false,
      overrideLimit: overrideConf ? overrideConf.supplyLimitPercentageOverride : null
    };
  });

  return analyticsArray;
};

// @desc    Get Demand & Supply Analytics
// @route   GET /api/demand-supply
// @access  Admin
export const getDemandSupplySettings = async (req, res) => {
  try {
    const settings = await DemandSupplySettings.getSingleton();
    
    // 1. Get filtered analytics for chart
    const filteredAnalytics = await calculateAnalytics(req.query, settings);
    
    // 2. Get global analytics for suggestions
    const globalAnalytics = await calculateAnalytics({}, settings);

    // 3. Generate suggestions from global analytics
    const globalSuggestions = globalAnalytics.map(row => {
      if (row.demandKw > 0 && row.supplyKw > row.demandKw) {
        return { type: 'warning', district: row.district, text: `Supply exceeds demand in ${row.district}. Consider lowering limit or pausing allocation.` };
      }
      if (row.demandKw > row.supplyKw * 1.5) {
        return { type: 'success', district: row.district, text: `Demand is high in ${row.district}. Consider increasing supply limit % to allow more EPC capacity.` };
      }
      return null;
    }).filter(Boolean);

    res.json({ 
      success: true, 
      data: settings, 
      analytics: filteredAnalytics,
      globalSuggestions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Regional Capacity Configuration
// @route   PUT /api/demand-supply/region
// @access  Admin
export const updateRegionConfig = async (req, res) => {
  try {
    const { country, state, district, projectType, isAcceptancePaused, supplyLimitPercentageOverride } = req.body;
    
    if (!district) {
      return res.status(400).json({ success: false, message: "District is required." });
    }

    const settings = await DemandSupplySettings.getSingleton();
    
    const pt = projectType || 'All';
    const regionIndex = settings.regions.findIndex(
      r => r.district === district && r.projectType === pt
    );

    if (regionIndex > -1) {
      if (isAcceptancePaused !== undefined) settings.regions[regionIndex].isAcceptancePaused = isAcceptancePaused;
      if (supplyLimitPercentageOverride !== undefined) settings.regions[regionIndex].supplyLimitPercentageOverride = supplyLimitPercentageOverride;
    } else {
      settings.regions.push({ 
        country: country || 'India', 
        state: state || 'Gujarat', 
        district, 
        projectType: pt,
        isAcceptancePaused: isAcceptancePaused || false,
        supplyLimitPercentageOverride: supplyLimitPercentageOverride || null
      });
    }

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Global Rules & Thresholds
// @route   PUT /api/demand-supply/global
// @access  Admin
export const updateGlobalSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await DemandSupplySettings.getSingleton();
    
    if (updates.rollingPeriodDays !== undefined) settings.rollingPeriodDays = updates.rollingPeriodDays;
    if (updates.supplyLimitPercentage !== undefined) settings.supplyLimitPercentage = updates.supplyLimitPercentage;
    if (updates.minSupplyThresholdKw !== undefined) settings.minSupplyThresholdKw = updates.minSupplyThresholdKw;
    if (updates.maxDemandCapacityKw !== undefined) settings.maxDemandCapacityKw = updates.maxDemandCapacityKw;
    if (updates.autoEnableWalletRecharge !== undefined) settings.autoEnableWalletRecharge = updates.autoEnableWalletRecharge;
    if (updates.autoEnableProjectAllocation !== undefined) settings.autoEnableProjectAllocation = updates.autoEnableProjectAllocation;
    
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { calculateAnalytics }; // export for cron job
