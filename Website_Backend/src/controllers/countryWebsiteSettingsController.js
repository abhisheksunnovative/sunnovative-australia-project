import CountryWebsiteSettings from "../models/CountryWebsiteSettings.js";

// GET all country settings (Admin)
export const getAllCountrySettings = async (req, res) => {
  try {
    const settings = await CountryWebsiteSettings.find();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch country settings", error: error.message });
  }
};

// GET a specific country setting by code (Public API for frontend)
export const getCountrySettingsByCode = async (req, res) => {
  try {
    const { countryCode } = req.params;
    let settings = await CountryWebsiteSettings.findOne({ 
      countryCode: countryCode.toUpperCase()
    });
    
    if (!settings) {
      settings = await CountryWebsiteSettings.create({
        countryCode: countryCode.toUpperCase(),
        countryName: getCountryNameFromCode(countryCode.toUpperCase()),
        currency: getCurrencyFromCode(countryCode.toUpperCase()),
        currencySymbol: getCurrencySymbolFromCode(countryCode.toUpperCase()),
        isEnabled: true,
        isPublished: true
      });
    } else if (!settings.isEnabled || !settings.isPublished) {
      settings.isEnabled = true;
      settings.isPublished = true;
      await settings.save();
    }
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch country settings", error: error.message });
  }
};

// GET a specific country setting by code (Admin API - ignores published state)
export const getAdminCountrySettingsByCode = async (req, res) => {
  try {
    const { countryCode } = req.params;
    let settings = await CountryWebsiteSettings.findOne({ countryCode: countryCode.toUpperCase() });
    
    if (!settings) {
      // Initialize basic skeleton if not found
      settings = await CountryWebsiteSettings.create({
        countryCode: countryCode.toUpperCase(),
        countryName: getCountryNameFromCode(countryCode.toUpperCase()),
        currency: getCurrencyFromCode(countryCode.toUpperCase()),
        currencySymbol: getCurrencySymbolFromCode(countryCode.toUpperCase())
      });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch/initialize country settings", error: error.message });
  }
};

// PUT update a specific country setting
export const updateCountrySettings = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const updateData = req.body;
    
    const updatedSettings = await CountryWebsiteSettings.findOneAndUpdate(
      { countryCode: countryCode.toUpperCase() },
      updateData,
      { new: true, upsert: true }
    );
    
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update country settings", error: error.message });
  }
};

// POST toggle publish status
export const togglePublishStatus = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { isPublished, isEnabled } = req.body;
    
    const settings = await CountryWebsiteSettings.findOne({ countryCode: countryCode.toUpperCase() });
    if (!settings) {
      return res.status(404).json({ message: "Country not found" });
    }
    
    if (isPublished !== undefined) settings.isPublished = isPublished;
    if (isEnabled !== undefined) settings.isEnabled = isEnabled;
    
    await settings.save();
    res.status(200).json({ message: "Status updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

// Helper functions for initialization
function getCountryNameFromCode(code) {
  const map = { 'IN': 'India', 'AU': 'Australia', 'NZ': 'New Zealand', 'UK': 'United Kingdom', 'US': 'United States' };
  return map[code] || 'Unknown';
}

function getCurrencyFromCode(code) {
  const map = { 'IN': 'INR', 'AU': 'AUD', 'NZ': 'NZD', 'UK': 'GBP', 'US': 'USD' };
  return map[code] || 'USD';
}

function getCurrencySymbolFromCode(code) {
  const map = { 'IN': '₹', 'AU': 'A$', 'NZ': 'NZ$', 'UK': '£', 'US': '$' };
  return map[code] || '$';
}
