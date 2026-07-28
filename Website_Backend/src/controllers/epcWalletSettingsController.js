import EpcWalletSettings from '../models/EpcWalletSettings.js';

// GET /api/epc/wallet/settings — used by Admin Panel (EpcWalletSettingsScreen.jsx)
export const getWalletSettings = async (req, res) => {
  try {
    const settings = await EpcWalletSettings.getSingleton();
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('getWalletSettings error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// PUT /api/epc/wallet/settings — used by Admin Panel Save button
export const updateWalletSettings = async (req, res) => {
  try {
    const {
      pricePerKW,
      freeTrialKwLimit,
      minRechargeKW,
      maxRechargeKW,
      lowBalanceAlertKW,
      autoRefillEnabled,
      rechargePackages,
    } = req.body;

    // Basic sanity checks so bad admin input can't break purchase logic downstream
    if (pricePerKW !== undefined && pricePerKW <= 0)
      return res.status(400).json({ success: false, message: 'Price per KW must be greater than 0' });
    if (minRechargeKW !== undefined && maxRechargeKW !== undefined && Number(minRechargeKW) > Number(maxRechargeKW))
      return res.status(400).json({ success: false, message: 'Minimum recharge cannot be greater than maximum recharge' });

    const settings = await EpcWalletSettings.getSingleton();

    if (pricePerKW !== undefined) settings.pricePerKW = pricePerKW;
    if (freeTrialKwLimit !== undefined) settings.freeTrialKwLimit = freeTrialKwLimit;
    if (minRechargeKW !== undefined) settings.minRechargeKW = minRechargeKW;
    if (maxRechargeKW !== undefined) settings.maxRechargeKW = maxRechargeKW;
    if (lowBalanceAlertKW !== undefined) settings.lowBalanceAlertKW = lowBalanceAlertKW;
    if (autoRefillEnabled !== undefined) settings.autoRefillEnabled = autoRefillEnabled;
    if (Array.isArray(rechargePackages)) settings.rechargePackages = rechargePackages;

    await settings.save();
    res.json({ success: true, data: settings, message: 'Wallet settings updated' });
  } catch (err) {
    console.error('updateWalletSettings error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET /api/epc/wallet/settings/public — used by EPC Client (safe subset, no admin-only fields needed)
export const getPublicWalletSettings = async (req, res) => {
  try {
    const settings = await EpcWalletSettings.getSingleton();
    res.json({
      success: true,
      data: {
        pricePerKW: settings.pricePerKW,
        minRechargeKW: settings.minRechargeKW,
        maxRechargeKW: settings.maxRechargeKW,
        rechargePackages: settings.rechargePackages.filter(p => p.enabled),
      },
    });
  } catch (err) {
    console.error('getPublicWalletSettings error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};