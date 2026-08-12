import ProjectPricing from "../models/ProjectPricing.js";
import PricingSystemSettings from "../models/PricingSystemSettings.js";
import Brand from "../models/Brand.js";

export const getCapacities = async (req, res) => {
  try {
    const { country } = req.query;
    if (!country) return res.status(400).json({ success: false, message: "Country is required" });

    const capacities = await ProjectPricing.find({ country: country.toLowerCase() })
      .select('systemSizeKW estimatedSubsidy projectPrice pricingResponsibility allowEpcToSetPrice solarPanel inverter dynamicBrands')
      .populate('solarPanel', 'name logoUrl type')
      .populate('inverter', 'name logoUrl type')
      .populate({
        path: 'dynamicBrands.brandIds',
        model: 'Brand',
        select: 'name logoUrl type'
      })
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
    if (req.query.projectType) filter.projectType = { $regex: new RegExp(`^${req.query.projectType}$`, 'i') };
    if (req.query.epcId) filter.epcId = req.query.epcId;
    if (req.query.pricingResponsibility) filter.pricingResponsibility = req.query.pricingResponsibility;

    const pricings = await ProjectPricing.find(filter)
      .populate('solarPanel')
      .populate('inverter')
      .populate({
          path: 'dynamicBrands.brandIds',
          model: 'Brand'
      })
      .populate({
          path: 'epcId',
          model: 'EpcPartner',
          select: 'name state district'
      })
      .sort({ systemSizeKW: 1 });
    
    // Map to frontend expected format
    const mapped = pricings.map(p => ({
      _id: p._id,
      country: p.country,
      projectType: p.projectType,
      kw: p.systemSizeKW,
      panelBrand: p.solarPanel,
      inverterBrand: p.inverter,
      dynamicBrands: p.dynamicBrands,
      finalPrice: p.projectPrice,
      pricingResponsibility: p.pricingResponsibility,
      allowEpcToSetPrice: p.allowEpcToSetPrice,
      isApproved: p.isApproved,
      epcId: p.epcId,
      isActive: true
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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

    let formattedDynamicBrands = [];
    if (req.body.dynamicBrands && typeof req.body.dynamicBrands === 'object' && !Array.isArray(req.body.dynamicBrands)) {
        formattedDynamicBrands = Object.keys(req.body.dynamicBrands).map(cat => ({
            category: cat,
            brandIds: req.body.dynamicBrands[cat].map(b => typeof b === 'object' ? (b._id || b.id) : b)
        }));
    } else if (Array.isArray(req.body.dynamicBrands)) {
        formattedDynamicBrands = req.body.dynamicBrands.map(db => ({
            category: db.category,
            brandIds: db.brandIds ? db.brandIds.map(b => typeof b === 'object' ? (b._id || b.id) : b) : []
        }));
    }

    const projectPriceVal = req.body.finalPrice || req.body.price || req.body.epcSubmittedPrice || 0;
    const newPricing = new ProjectPricing({
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      dynamicBrands: formattedDynamicBrands,
      projectPrice: projectPriceVal,
      pricingResponsibility,
      allowEpcToSetPrice,
      epcId: epcId || null,
      isApproved: true
    });
    
    await newPricing.save();
    res.status(201).json({ success: true, data: newPricing });
  } catch (error) {
    console.error("createPricing error:", error);
    res.status(500).json({ success: false, message: error.message });
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

    let formattedDynamicBrands = [];
    if (req.body.dynamicBrands && typeof req.body.dynamicBrands === 'object' && !Array.isArray(req.body.dynamicBrands)) {
        formattedDynamicBrands = Object.keys(req.body.dynamicBrands).map(cat => ({
            category: cat,
            brandIds: req.body.dynamicBrands[cat]
        }));
    } else if (Array.isArray(req.body.dynamicBrands)) {
        formattedDynamicBrands = req.body.dynamicBrands;
    }

    const updated = await ProjectPricing.findByIdAndUpdate(id, {
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      dynamicBrands: formattedDynamicBrands,
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
    }).populate('solarPanel').populate('inverter').populate({ path: 'dynamicBrands.brandIds', model: 'Brand' });

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
