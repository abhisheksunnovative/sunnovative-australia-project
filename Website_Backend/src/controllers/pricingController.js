import ProjectPricing from "../models/ProjectPricing.js";
import PricingSystemSettings from "../models/PricingSystemSettings.js";
import Brand from "../models/Brand.js";

export const getCapacities = async (req, res) => {
  try {
    const { country } = req.query;
    if (!country) return res.status(400).json({ success: false, message: "Country is required" });

    const capacities = await ProjectPricing.find({ country: country.toLowerCase() })
      .select('systemSizeKW estimatedSubsidy projectPrice pricingResponsibility allowEpcToSetPrice solarPanel inverter')
      .populate('solarPanel', 'name logoUrl type')
      .populate('inverter', 'name logoUrl type')
      .sort({ systemSizeKW: 1 });

    res.json({ success: true, data: capacities });
  } catch (error) {
    console.error("Error fetching capacities:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPricings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.country) filter.country = req.query.country.toLowerCase();
    if (req.query.projectType) filter.projectType = req.query.projectType;

    const pricings = await ProjectPricing.find(filter)
      .populate('solarPanel')
      .populate('inverter')
      .sort({ systemSizeKW: 1 });
    
    // Map to frontend expected format
    const mapped = pricings.map(p => ({
      _id: p._id,
      country: p.country,
      projectType: p.projectType,
      kw: p.systemSizeKW,
      panelBrand: p.solarPanel,
      inverterBrand: p.inverter,
      finalPrice: p.projectPrice,
      pricingResponsibility: p.pricingResponsibility,
      allowEpcToSetPrice: p.allowEpcToSetPrice,
      isApproved: p.isApproved,
      epcId: p.epcId,
      isActive: true
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const createPricing = async (req, res) => {
  try {
    const { country, projectType, kw, panelBrand, inverterBrand, finalPrice, pricingResponsibility, allowEpcToSetPrice, epcId } = req.body;
    
    // Enforcement check
    const settings = await PricingSystemSettings.findOne({ country: country.toLowerCase(), projectType });
    const systemScope = settings ? settings.system : 'company';
    
    if (systemScope === 'epc' && pricingResponsibility === 'Company') {
      return res.status(403).json({ success: false, message: "Cannot create Company-fixed pricing when scope is EPC self-priced." });
    }
    if (systemScope === 'company' && pricingResponsibility === 'EPC') {
      return res.status(403).json({ success: false, message: "Cannot create EPC pricing when scope is Company-fixed." });
    }

    const newPricing = new ProjectPricing({
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      projectPrice: finalPrice || 0,
      pricingResponsibility,
      allowEpcToSetPrice,
      epcId: epcId || null,
      isApproved: pricingResponsibility === 'Company' // Auto approve company ones
    });
    
    await newPricing.save();
    res.status(201).json({ success: true, data: newPricing });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const updatePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { country, projectType, kw, panelBrand, inverterBrand, finalPrice, pricingResponsibility, allowEpcToSetPrice, epcId } = req.body;
    
    const existing = await ProjectPricing.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    // EPC Authorization Check
    if (req.user && req.user.role === 'epc') {
       if (existing.pricingResponsibility !== 'EPC' || String(existing.epcId) !== String(req.user._id)) {
           return res.status(403).json({ success: false, message: "Unauthorized to edit this pricing" });
       }
    }

    // Enforcement check
    const settings = await PricingSystemSettings.findOne({ country: country.toLowerCase(), projectType });
    const systemScope = settings ? settings.system : 'company';
    
    if (systemScope === 'epc' && pricingResponsibility === 'Company') {
      return res.status(403).json({ success: false, message: "Cannot update to Company-fixed pricing when scope is EPC self-priced." });
    }
    if (systemScope === 'company' && pricingResponsibility === 'EPC') {
      return res.status(403).json({ success: false, message: "Cannot update to EPC pricing when scope is Company-fixed." });
    }

    const updated = await ProjectPricing.findByIdAndUpdate(id, {
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      projectPrice: finalPrice || 0,
      pricingResponsibility,
      allowEpcToSetPrice,
      epcId: epcId || existing.epcId
    }, { new: true });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deletePricing = async (req, res) => {
  try {
    const existing = await ProjectPricing.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    // EPC Authorization Check
    if (req.user && req.user.role === 'epc') {
       if (existing.pricingResponsibility !== 'EPC' || String(existing.epcId) !== String(req.user._id)) {
           return res.status(403).json({ success: false, message: "Unauthorized to delete this pricing" });
       }
    }

    await ProjectPricing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const resolvePricing = async (req, res) => {
  try {
    const { country, projectType, kw } = req.query;
    if (!country || !projectType || !kw) {
       return res.status(400).json({ success: false, message: "Missing required params" });
    }

    const pricings = await ProjectPricing.find({
       country: country.toLowerCase(),
       projectType: projectType,
       systemSizeKW: Number(kw)
    }).populate('solarPanel').populate('inverter');

    const brands = await Brand.find({ 
       country: country.toLowerCase(), 
       projectTypes: projectType, 
       availableKw: Number(kw), 
       isActive: true 
    });

    res.json({ success: true, data: { pricings, brands } });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
