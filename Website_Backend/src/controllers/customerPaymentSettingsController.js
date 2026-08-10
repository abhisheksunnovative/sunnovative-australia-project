import CustomerPaymentSettings from "../models/CustomerPaymentSettings.js";

// GET ?country=australia
export const getPaymentSettings = async (req, res) => {
  try {
    const { country = "australia" } = req.query;
    let settings = await CustomerPaymentSettings.findOne({ country: country.toLowerCase() });
    if (!settings) {
      settings = new CustomerPaymentSettings({ country: country.toLowerCase(), projectConfigs: [] });
      await settings.save();
    }
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST
export const savePaymentSettings = async (req, res) => {
  try {
    const { country = "australia", projectConfigs } = req.body;
    let settings = await CustomerPaymentSettings.findOne({ country: country.toLowerCase() });
    if (!settings) {
      settings = new CustomerPaymentSettings({ country: country.toLowerCase(), projectConfigs });
    } else {
      settings.projectConfigs = projectConfigs;
    }
    await settings.save();
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
