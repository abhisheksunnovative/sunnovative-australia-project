import crypto from 'crypto';
import EpcWallet from '../models/EpcWallet.js';
import EpcWalletSettings from '../models/EpcWalletSettings.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import { razorpay } from '../config/razorpay.js';
import { sendLowBalanceAlert } from '../utils/sendWalletAlertEmail.js';
import EpcPartner from '../models/EpcPartner.js';
import EpcPlan from '../models/EpcPlan.js';
import EpcKwPackage from '../models/EpcKwPackage.js';

// ── Helper: fetch valid project types from OrderJourneySettings ─────────────
const getValidProjectTypes = async (epc) => {
  const country = epc?.country || 'india';
  const state = epc?.state || 'all';
  const district = epc?.district || 'all';
  
  let settings = await OrderJourneySettings.findOne({ country, state, district });
  if (!settings && district !== 'all') {
    settings = await OrderJourneySettings.findOne({ country, state, district: 'all' });
  }
  if (!settings && state !== 'all') {
    settings = await OrderJourneySettings.findOne({ country, state: 'all', district: 'all' });
  }
  
  if (settings && settings.journeys) {
    return settings.journeys.map(j => j.projectType);
  }
  return [];
};

// ── Helper: fetch a wallet for this EPC, creating it (with admin-configured
//    free trial limit) if it doesn't exist yet ─────────────────────────────
const getOrCreateWallet = async (epcPartnerId) => {
  let wallet = await EpcWallet.findOne({ epcPartner: epcPartnerId });
  if (!wallet) {
    const settings = await EpcWalletSettings.getSingleton();
    wallet = await EpcWallet.create({
      epcPartner: epcPartnerId,
      freeTrialKwLimit: settings.freeTrialKwLimit,
    });
  }
  return wallet;
};

// ── Helper: check balance against admin threshold, email once per dip
//    (resets once balance goes back above the threshold) ───────────────────
const checkAndSendLowBalanceAlert = async (wallet, epc) => {
  try {
    const settings = await EpcWalletSettings.getSingleton();
    const total = wallet.getTotalCredits();
    const isLow = total <= settings.lowBalanceAlertKW;

    if (isLow && !wallet.lastLowBalanceAlertAt) {
      await sendLowBalanceAlert({
        toEmail: epc?.email,
        epcName: epc?.companyName || epc?.name,
        totalCredits: total,
        lowBalanceAlertKW: settings.lowBalanceAlertKW,
      });
      wallet.lastLowBalanceAlertAt = new Date();
      await wallet.save();
      
      // Feature Attribution tracking
      if (req.body.attributedFeatureId) {
        try {
          // Fire and forget attribution
          fetch(`http://localhost:4005/api/platform-analytics/${req.body.attributedFeatureId}/track-attribution`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'recharge', kw: req.body.kwRechargeAmount })
          }).catch(e => console.error("Attribution error:", e));
        } catch (e) {}
      }
    } else if (!isLow && wallet.lastLowBalanceAlertAt) {
      // balance recovered — allow a fresh alert next time it dips again
      wallet.lastLowBalanceAlertAt = null;
      await wallet.save();
    }
  } catch (err) {
    // Alerting must never break the core wallet flow
    console.error('checkAndSendLowBalanceAlert error:', err.message);
  }
};

export const getWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.epc._id);
    const settings = await EpcWalletSettings.getSingleton();

    const freeTrialRemaining = Math.max(0, wallet.freeTrialKwLimit - wallet.freeTrialKwUsed);
    const totalCredits = wallet.getTotalCredits();

    const country = req.epc?.country || 'india';
    const state = req.epc?.state || 'all';
    const district = req.epc?.district || 'all';
    
    let journeySettings = await OrderJourneySettings.findOne({ country, state, district });
    if (!journeySettings && district !== 'all') {
      journeySettings = await OrderJourneySettings.findOne({ country, state, district: 'all' });
    }
    if (!journeySettings && state !== 'all') {
      journeySettings = await OrderJourneySettings.findOne({ country, state: 'all', district: 'all' });
    }
    
    const availableProjectTypes = journeySettings?.journeys ? journeySettings.journeys.map(j => j.projectType) : [];

    res.json({
      totalCredits,
      freeTrialKwLimit:    wallet.freeTrialKwLimit,
      freeTrialKwUsed:     wallet.freeTrialKwUsed,
      freeTrialRemaining,
      creditsByType:       wallet.credits,
      availableProjectTypes,
      recentTransactions:  wallet.transactions.slice(-20).reverse(),
      pricePerCredit:      settings.pricePerKW,
      minRechargeKW:       settings.minRechargeKW,
      maxRechargeKW:       settings.maxRechargeKW,
      lowBalanceAlertKW:   settings.lowBalanceAlertKW,
      isLowBalance:        totalCredits <= settings.lowBalanceAlertKW,
      rechargePackages:    settings.rechargePackages.filter(p => p.enabled),
      razorpayKeyId:       process.env.RAZORPAY_KEY_ID, // frontend Razorpay checkout needs this
    });
  } catch (err) {
    console.error('getWallet error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// STEP 1 — Create a Razorpay order for the requested recharge (package or
// custom KW). Nothing is credited yet — that only happens after payment is
// verified in verifyRechargePayment below.
// ══════════════════════════════════════════════════════════════════════════
export const createRechargeOrder = async (req, res) => {
  try {
    const { projectType, kw, packageId } = req.body;
    const validProjectTypes = await getValidProjectTypes(req.epc);
    if (!projectType || !validProjectTypes.includes(projectType))
      return res.status(400).json({ message: `Invalid project type. Must be one of: ${validProjectTypes.join(', ')}` });
    
    // Automatically pick up district from EPC profile
    const district = req.epc.district || (req.epc.activeDistricts && req.epc.activeDistricts[0]) || req.epc.hqLocation || 'Unknown';
    if (!district || district === 'Unknown') {
      return res.status(400).json({ message: `Please update your profile with a valid district before recharging.`, code: 'DISTRICT_REQUIRED' });
    }

    const settings = await EpcWalletSettings.getSingleton();
    let kwNum, amount;

    const isAU = req.epc.country === 'australia' || req.epc.country === 'AU';

    if (packageId) {
      const pkg = await EpcKwPackage.findOne({ _id: packageId, isActive: true });
      if (!pkg) return res.status(400).json({ message: 'Selected package not available' });
      kwNum = pkg.kwAmount;
      amount = isAU ? kwNum * 150 : pkg.finalPrice; // Base logic for AU

    } else {
      kwNum = Number(kw);
      if (!kwNum || kwNum <= 0) return res.status(400).json({ message: 'Enter valid KW amount to purchase' });
      if (kwNum < settings.minRechargeKW)
        return res.status(400).json({ message: `Minimum recharge is ${settings.minRechargeKW} KW` });
      if (kwNum > settings.maxRechargeKW)
        return res.status(400).json({ message: `Maximum recharge per transaction is ${settings.maxRechargeKW} KW` });
      amount = isAU ? kwNum * 150 : kwNum * settings.pricePerKW;
    }

    // Razorpay wants amount in paise (or cents for AUD), and order receipts must be <= 40 chars
    // Preparation for Stripe integration, but using Razorpay test for now
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: isAU ? 'AUD' : 'INR',
      receipt: `epcw_${req.epc._id.toString().slice(-8)}_${Date.now()}`.slice(0, 40),
      notes: {
        epcPartnerId: req.epc._id.toString(),
        projectType,
        kw: kwNum,
        packageId: packageId || 'custom',
        district,
      },
    });

    res.json({
      orderId:  razorpayOrder.id,
      amount:   razorpayOrder.amount, // paise
      currency: razorpayOrder.currency,
      kw:       kwNum,
      projectType,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createRechargeOrder error:', err);
    res.status(500).json({ message: 'Could not create payment order', error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// STEP 2 — Frontend calls this after Razorpay checkout succeeds. We verify
// the signature server-side (never trust the client), and only THEN credit
// the wallet. This is the step that replaces the old "credits added
// directly for now" placeholder.
// ══════════════════════════════════════════════════════════════════════════
export const verifyRechargePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      projectType,
      kw,
      packageId,
    } = req.body;

    // Automatically pick up district from EPC profile
    const district = req.epc.district || (req.epc.activeDistricts && req.epc.activeDistricts[0]) || req.epc.hqLocation || 'Unknown';

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: 'Missing payment verification fields' });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });
    }

    // Signature valid → fetch the actual order from Razorpay to confirm amount/status
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (order.status !== 'paid') {
      return res.status(400).json({ message: `Payment not completed (status: ${order.status})` });
    }

    const kwNum = Number(kw);
    const amount = order.amount / 100; // back to rupees

    const wallet = await getOrCreateWallet(req.epc._id);

    const entry = wallet.credits.find(c => c.projectType === projectType && c.district === district);
    if (entry) entry.credits += kwNum;
    else wallet.credits.push({ projectType, district, credits: kwNum });

    wallet.transactions.push({
      type:        'PURCHASE',
      district:    district,
      projectType,
      kw:          kwNum,
      amount,
      note:        `Purchased ${kwNum} KW credits for ${projectType}${packageId && packageId !== 'custom' ? ` (${packageId} pack)` : ''} — Razorpay payment ${razorpay_payment_id}`,
    });

    await wallet.save();
    await checkAndSendLowBalanceAlert(wallet, req.epc); // in case this was a partial/insufficient recharge

    res.json({
      message:      `Payment successful — ${kwNum} KW credited for ${projectType}`,
      amountPaid:   amount,
      newBalance:   wallet.getCreditsFor(projectType),
      totalCredits: wallet.getTotalCredits(),
    });
  } catch (err) {
    console.error('verifyRechargePayment error:', err);
    res.status(500).json({ message: 'Server error while verifying payment', error: err.message });
  }
};

export const checkEligibility = async (req, res) => {
  try {
    const { projectType, kwRequired } = req.body;
    const validProjectTypes = await getValidProjectTypes(req.epc);
    if (!projectType || !validProjectTypes.includes(projectType)) return res.status(400).json({ message: 'Invalid project type' });

    const kwNum = Number(kwRequired);
    if (!kwNum || kwNum <= 0) return res.status(400).json({ message: 'Invalid KW requirement' });

    const wallet = await getOrCreateWallet(req.epc._id);
    const result = wallet.canAcceptOrder(projectType, kwNum);

    res.json({
      eligible:           result.canAccept,
      kwRequired:          kwNum,
      freeTrialRemaining:  result.freeTrialRemaining,
      paidCredits:         result.paidCredits,
      shortfall:           result.canAccept ? 0 : kwNum - (result.freeTrialRemaining + result.paidCredits),
      message: result.canAccept
        ? 'Eligible to accept this order'
        : `Insufficient credits. You need ${kwNum - (result.freeTrialRemaining + result.paidCredits)} more KW credits for ${projectType}`,
    });
  } catch (err) {
    console.error('checkEligibility error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deductCreditsForOrder = async (epcPartnerId, projectType, kwRequired, referenceId, isEnquiry = false) => {
  const wallet = await getOrCreateWallet(epcPartnerId);

  const result = wallet.canAcceptOrder(projectType, kwRequired);
  if (!result.canAccept) {
    throw new Error(`Insufficient credits for ${projectType}. Need ${kwRequired - (result.freeTrialRemaining + result.paidCredits)} more KW.`);
  }

  let remainingToDeduct = kwRequired;
  if (result.freeTrialRemaining > 0) {
    const useFromTrial = Math.min(result.freeTrialRemaining, remainingToDeduct);
    wallet.freeTrialKwUsed += useFromTrial;
    remainingToDeduct -= useFromTrial;
  }

  if (remainingToDeduct > 0) {
    const entry = wallet.credits.find(c => c.projectType === projectType);
    if (entry) entry.credits -= remainingToDeduct;
  }

  wallet.transactions.push({
    type:        'DEDUCT',
    projectType,
    kw:          kwRequired,
    orderId:     isEnquiry ? null : referenceId,
    enquiryId:   isEnquiry ? referenceId : null,
    note:        `Order accepted — ${kwRequired} KW deducted for ${projectType}`,
  });

  await wallet.save();

  // Fetch minimal EPC info for the email (adjust field names to your EpcPartner schema if different)
  try {
    const EpcPartner = (await import('../models/EpcPartner.js')).default;
    const epc = await EpcPartner.findById(epcPartnerId).select('email companyName name');
    await checkAndSendLowBalanceAlert(wallet, epc);
  } catch (err) {
    console.error('low-balance alert lookup error:', err.message);
  }

  return wallet;
};

export const refundCredits = async (req, res) => {
  try {
    const { projectType, kw, orderId } = req.body;
    const validProjectTypes = await getValidProjectTypes(req.epc);
    if (!projectType || !validProjectTypes.includes(projectType)) return res.status(400).json({ message: 'Invalid project type' });

    const wallet = await EpcWallet.findOne({ epcPartner: req.epc._id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const entry = wallet.credits.find(c => c.projectType === projectType);
    if (entry) entry.credits += Number(kw);
    else wallet.credits.push({ projectType, credits: Number(kw) });

    wallet.transactions.push({
      type: 'REFUND', projectType, kw: Number(kw), orderId,
      note: `Refunded ${kw} KW for cancelled order`,
    });

    await wallet.save();
    res.json({ message: 'Credits refunded', newBalance: wallet.getCreditsFor(projectType) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const transferKW = async (req, res) => {
    try {
        const { fromDistrict, toDistrict, projectType, kwAmount } = req.body;
        if (!fromDistrict || !toDistrict || !projectType || !kwAmount) return res.status(400).json({ message: 'Missing required fields' });
        if (fromDistrict === toDistrict) return res.status(400).json({ message: 'Source and destination districts cannot be the same' });
        const amount = Number(kwAmount);
        if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const epc = await EpcPartner.findById(req.epc._id);
        if (!epc) return res.status(404).json({ message: 'EPC not found' });

        // Cross-district logic checks
        const plan = await EpcPlan.findOne({ name: epc.plan || 'Standard' });
        if (plan && plan.loginScope === 'District') {
            return res.status(403).json({ 
                message: 'Your current plan restricts you to a single district. Please upgrade your plan to transfer KW across districts.',
                code: 'CROSS_DISTRICT_NOT_ALLOWED' 
            });
        }

        const activeDistricts = epc.activeDistricts || [];
        if (!activeDistricts.includes(fromDistrict)) {
            return res.status(400).json({ message: `Source district ${fromDistrict} is not in your active districts` });
        }
        if (!activeDistricts.includes(toDistrict)) {
            return res.status(400).json({ message: `Destination district ${toDistrict} is not in your active districts. Please add it first.` });
        }

        const wallet = await EpcWallet.findOne({ epcPartner: req.epc._id });
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        const fromEntryIndex = wallet.credits.findIndex(c => c.projectType === projectType && c.district === fromDistrict);
        if (fromEntryIndex === -1 || wallet.credits[fromEntryIndex].credits < amount) {
            return res.status(400).json({ message: `Insufficient credits in ${fromDistrict} for ${projectType}` });
        }

        // --- Demand and Supply Blockage on Transfer ---
        const dsSettings = await (await import('../models/DemandSupplySettings.js')).default.getSingleton();
        const rollingDays = dsSettings.rollingPeriodDays || 30; // Using 30 days as rolling period for transfers as suggested
        const rollingDate = new Date();
        rollingDate.setDate(rollingDate.getDate() - rollingDays);
        
        const mappedType = (projectType === 'Residential Solar' || projectType === 'Surya Ghar Yojana') ? 'residential' : 
                           projectType === 'Commercial Solar' ? 'commercial' :
                           projectType === 'Group Solar' ? 'group' : 'common-meter';
                           
        const leads = await (await import('../models/ProjectModel.js')).ProjectOrder.find({ 
          "location.district": toDistrict, 
          projectType: mappedType, 
          createdAt: { $gte: rollingDate } 
        });
        
        let demandKw = 0;
        leads.forEach(l => demandKw += Number(l.systemSizeKW || 0));

        const wallets = await EpcWallet.find({});
        let supplyKw = 0;
        wallets.forEach(w => {
          w.credits.forEach(c => {
            if (c.district === toDistrict && c.projectType === projectType) {
              supplyKw += c.credits;
            }
          });
        });

        const totalExpectedSupply = supplyKw + amount;
        const regionConf = dsSettings.regions.find(r => r.district === toDistrict && (r.projectType === projectType || r.projectType === 'All'));
        const targetPercent = regionConf && regionConf.supplyLimitPercentageOverride 
          ? regionConf.supplyLimitPercentageOverride 
          : (dsSettings.supplyLimitPercentage || 100);
          
        let allowedSupply = demandKw * (targetPercent / 100);

        if (totalExpectedSupply > allowedSupply) {
            const { createNotification } = await import('./notificationController.js');
            await createNotification('EpcPartner', 'Transfer Blocked', `Demand in ${toDistrict} is low. Blocked transferring ${amount} KW to prevent credit wastage.`, req.epc._id);
            return res.status(400).json({ 
                message: `Is district (${toDistrict}) me abhi itni demand nahi hai (Total Demand: ${demandKw} KW). Kripya yaha apne KW transfer karke waste mat karein.`,
                code: 'EXCESS_SUPPLY_BLOCK'
            });
        }
        // ----------------------------------------------

        wallet.credits[fromEntryIndex].credits -= amount;

        const toEntryIndex = wallet.credits.findIndex(c => c.projectType === projectType && c.district === toDistrict);
        if (toEntryIndex === -1) {
            wallet.credits.push({ district: toDistrict, projectType, credits: amount });
        } else {
            wallet.credits[toEntryIndex].credits += amount;
        }

        wallet.transactions.push({
            type: 'PURCHASE',
            projectType,
            kw: amount,
            note: `Transferred ${amount} KW from ${fromDistrict} to ${toDistrict}`,
        });

        await wallet.save();
        res.json({ message: 'Transfer successful', wallet });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
