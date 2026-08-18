import EpcPaymentSettings from "../models/EpcPaymentSettings.js";
import CustomerPaymentSettings from "../models/CustomerPaymentSettings.js";

// GET /api/epc/payment-settings?country=...&projectType=...
export const getEpcSettings = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const { country, projectType } = req.query;

    if (!country || !projectType) {
      return res.status(400).json({ success: false, message: "Country and Project Type are required" });
    }

    let settings = await EpcPaymentSettings.findOne({
      epcId,
      country: country.toLowerCase(),
      projectType: projectType.toLowerCase()
    });

    if (!settings) {
      settings = {
        epcId,
        country: country.toLowerCase(),
        projectType: projectType.toLowerCase(),
        signupTokenAmount: 0,
        stagePayments: []
      };
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/epc/payment-settings
export const saveEpcSettings = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const { country, projectType, signupTokenAmount, stagePayments } = req.body;

    if (!country || !projectType) {
      return res.status(400).json({ success: false, message: "Country and Project Type are required" });
    }

    // 1. Fetch Admin's CustomerPaymentSettings limits
    const adminSettings = await CustomerPaymentSettings.findOne({ country: country.toLowerCase() });
    if (!adminSettings) {
      return res.status(400).json({ success: false, message: `Payment settings limits are not configured by Admin for ${country}` });
    }

    const config = adminSettings.projectConfigs?.find(c => c.projectType.toLowerCase() === projectType.toLowerCase());
    if (!config) {
      return res.status(400).json({ success: false, message: `Payment settings are not configured by Admin for project type: ${projectType}` });
    }

    // 2. Validate EPC custom values against limits and calculate total percentage
    let totalPercentage = 0;
    const stages = config.paymentStages || [];

    for (const stage of stages) {
      let val = stage.defaultValue;

      if (stage.epcCanEdit) {
        const customStage = stagePayments?.find(s => s.stageKey === stage.stageKey);
        if (customStage) {
          val = Number(customStage.customValue) || 0;
          
          // Enforce admin upper limit
          if (val > stage.maxLimit) {
            return res.status(400).json({
              success: false,
              message: `Stage "${stage.label}" (${val}%) exceeds the Admin maximum limit of ${stage.maxLimit}%.`
            });
          }
        }
      }

      if (stage.valueType === "percentage") {
        totalPercentage += val;
      }
    }

    // Validate that percentage splits sum to exactly 100%
    if (stages.some(s => s.valueType === "percentage") && totalPercentage !== 100) {
      return res.status(400).json({
        success: false,
        message: `The sum of all percentage-based milestones must equal exactly 100% (currently it sums to ${totalPercentage}%).`
      });
    }

    // 3. Save/Update EPC settings
    let epcSettings = await EpcPaymentSettings.findOne({
      epcId,
      country: country.toLowerCase(),
      projectType: projectType.toLowerCase()
    });

    if (!epcSettings) {
      epcSettings = new EpcPaymentSettings({
        epcId,
        country: country.toLowerCase(),
        projectType: projectType.toLowerCase(),
        signupTokenAmount: Number(signupTokenAmount) || 0,
        stagePayments: stagePayments || []
      });
    } else {
      epcSettings.signupTokenAmount = Number(signupTokenAmount) || 0;
      epcSettings.stagePayments = stagePayments || [];
    }

    await epcSettings.save();
    return res.status(200).json({ success: true, message: "Customer payment settings saved successfully!", data: epcSettings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
