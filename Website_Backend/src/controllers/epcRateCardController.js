import EpcRateGuardrailSettings from "../models/EpcRateGuardrailSettings.js";
import EpcRateCard from "../models/EpcRateCard.js";

// GET ?country=australia
export const getGuardrails = async (req, res) => {
  try {
    const { country = "australia" } = req.query;
    const settings = await EpcRateGuardrailSettings.findOne({ country: country.toLowerCase() });
    if (!settings) {
      return res.status(200).json({ guardrails: [], enforceGuardrails: true, country });
    }
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST (admin only)
export const saveGuardrails = async (req, res) => {
  try {
    const { country = "australia", guardrails, enforceGuardrails } = req.body;
    const cStr = country.toLowerCase();
    let settings = await EpcRateGuardrailSettings.findOne({ country: cStr });
    if (!settings) {
      settings = new EpcRateGuardrailSettings({ country: cStr, guardrails, enforceGuardrails });
    } else {
      settings.guardrails = guardrails;
      if (enforceGuardrails !== undefined) settings.enforceGuardrails = enforceGuardrails;
    }
    await settings.save();
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET (EPC auth)
export const getMyRateCard = async (req, res) => {
  try {
    const epcId = req.user._id || req.body.epcId; // assuming standard auth middleware
    const { country = "australia" } = req.query;
    const rateCards = await EpcRateCard.find({ epcPartner: epcId, country: country.toLowerCase() });
    return res.status(200).json(rateCards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST (EPC auth)
export const saveMyRateCard = async (req, res) => {
  try {
    const epcId = req.user?._id || req.body.epcId;
    const { country = "australia", projectType, flatRatePerKw, tiers, isActive = true } = req.body;
    const cStr = country.toLowerCase();
    
    // Check guardrails
    const settings = await EpcRateGuardrailSettings.findOne({ country: cStr });
    if (settings && settings.enforceGuardrails) {
      const guardrail = settings.guardrails.find(g => g.projectType === projectType);
      if (guardrail) {
        if (flatRatePerKw > 0) {
          if (flatRatePerKw < guardrail.minRatePerKw || flatRatePerKw > guardrail.maxRatePerKw) {
            return res.status(400).json({ message: `Rate ${flatRatePerKw} for ${projectType} is outside allowed band (${guardrail.minRatePerKw}-${guardrail.maxRatePerKw})` });
          }
        }
        if (tiers && tiers.length > 0) {
          for (let tier of tiers) {
            if (tier.ratePerKw < guardrail.minRatePerKw || tier.ratePerKw > guardrail.maxRatePerKw) {
              return res.status(400).json({ message: `Tier Rate ${tier.ratePerKw} for ${projectType} is outside allowed band (${guardrail.minRatePerKw}-${guardrail.maxRatePerKw})` });
            }
          }
        }
      }
    }

    let rateCard = await EpcRateCard.findOne({ epcPartner: epcId, country: cStr, projectType });
    if (!rateCard) {
      rateCard = new EpcRateCard({ epcPartner: epcId, country: cStr, projectType, flatRatePerKw, tiers, isActive });
    } else {
      rateCard.flatRatePerKw = flatRatePerKw;
      rateCard.tiers = tiers;
      rateCard.isActive = isActive;
      rateCard.lastUpdatedByEpc = Date.now();
    }
    await rateCard.save();
    return res.status(200).json(rateCard);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET (admin)
export const getAllRateCardsAdmin = async (req, res) => {
  try {
    const { country = "australia" } = req.query;
    const rateCards = await EpcRateCard.find({ country: country.toLowerCase() }).populate('epcPartner', 'ownerName companyName email');
    return res.status(200).json(rateCards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal Helper (used by Stage 2/3)
export const getEpcRateForCustomer = async (epcId, projectType, kw, country = "australia") => {
  const rateCard = await EpcRateCard.findOne({ epcPartner: epcId, country: country.toLowerCase(), projectType, isActive: true });
  if (!rateCard) return 0;
  
  if (rateCard.tiers && rateCard.tiers.length > 0) {
    const matchingTier = rateCard.tiers.find(t => kw >= t.minKw && kw <= t.maxKw);
    if (matchingTier) return matchingTier.ratePerKw;
  }
  
  return rateCard.flatRatePerKw || 0;
};
