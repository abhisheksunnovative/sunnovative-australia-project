import EpcSystemSettings from '../models/EpcSystemSettings.js';

export const getSystemSettings = async (req, res) => {
  try {
    const settings = await EpcSystemSettings.getSingleton();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching EPC system settings', error: error.message });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const settings = await EpcSystemSettings.getSingleton();
    if (req.body.overdueSettings) settings.overdueSettings = req.body.overdueSettings;
    if (req.body.trustBadgeSettings) settings.trustBadgeSettings = req.body.trustBadgeSettings;
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating EPC system settings', error: error.message });
  }
};
