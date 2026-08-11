import ProjectPricing from "../models/ProjectPricing.js";

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
      isActive: true
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const createPricing = async (req, res) => {
  try {
    const { country, projectType, kw, panelBrand, inverterBrand, finalPrice, pricingResponsibility, allowEpcToSetPrice } = req.body;
    
    const newPricing = new ProjectPricing({
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      projectPrice: finalPrice,
      pricingResponsibility,
      allowEpcToSetPrice
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
    const { country, projectType, kw, panelBrand, inverterBrand, finalPrice, pricingResponsibility, allowEpcToSetPrice } = req.body;
    
    const updated = await ProjectPricing.findByIdAndUpdate(id, {
      country,
      projectType,
      systemSizeKW: kw,
      solarPanel: panelBrand || null,
      inverter: inverterBrand || null,
      projectPrice: finalPrice,
      pricingResponsibility,
      allowEpcToSetPrice
    }, { new: true });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deletePricing = async (req, res) => {
  try {
    await ProjectPricing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
