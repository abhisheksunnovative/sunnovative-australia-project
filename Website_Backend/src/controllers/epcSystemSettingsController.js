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
    
    if (req.body.regionRules) {
      settings.regionRules = req.body.regionRules;
    }
    
    // Legacy fallbacks
    if (req.body.trustBadgeSettings) {
      settings.trustBadgeSettings = req.body.trustBadgeSettings;
    }
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating EPC system settings', error: error.message });
  }
};

// Add a specific controller method to update a single region rule
export const updateRegionRule = async (req, res) => {
  try {
    const { country, state, projectType, overdueSettings, trustBadgeSettings, customerSelectEpcSettings } = req.body;
    
    if (!country || !state || !projectType) {
      return res.status(400).json({ message: 'Country, State, and ProjectType are required.' });
    }

    const settings = await EpcSystemSettings.getSingleton();
    
    // Find if rule already exists
    const ruleIndex = settings.regionRules.findIndex(
      r => r.country === country && r.state === state && r.projectType === projectType
    );

    const newRule = {
      country,
      state,
      projectType,
      overdueSettings,
      trustBadgeSettings,
      customerSelectEpcSettings
    };

    if (ruleIndex >= 0) {
      settings.regionRules[ruleIndex] = newRule;
    } else {
      settings.regionRules.push(newRule);
    }

    await settings.save();
    res.json({ message: 'Region rule updated successfully', rule: newRule });
  } catch (error) {
    res.status(500).json({ message: 'Error updating region rule', error: error.message });
  }
};
