import PricingSystemSettings from "../models/PricingSystemSettings.js";

export const getSettings = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = {};
    if (country) filter.country = country.toLowerCase();
    
    const settings = await PricingSystemSettings.find(filter);
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching pricing system settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pricing system settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { country, projectType, system, isActive } = req.body;
    
    if (!country) {
      return res.status(400).json({ success: false, message: "Country is required" });
    }

    const filter = { country: country.toLowerCase() };
    if (projectType) {
      filter.projectType = projectType;
    } else {
      filter.projectType = null;
    }

    const update = { system };
    if (isActive !== undefined) update.isActive = isActive;

    const settings = await PricingSystemSettings.findOneAndUpdate(
      filter,
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json({ success: true, data: settings, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating pricing system settings:", error);
    res.status(500).json({ success: false, message: "Failed to update pricing system settings" });
  }
};
