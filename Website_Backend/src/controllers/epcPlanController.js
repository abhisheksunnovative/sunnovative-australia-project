import EpcPlan from '../models/EpcPlan.js';
import EpcPartner from '../models/EpcPartner.js';
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

export const getAllPlans = async (req, res) => {
  try {
    let plans = await EpcPlan.find({ isActive: true }).sort({ monthlyFee: 1 });
    
    // Auto-seed default plans if database is empty
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: 'Standard',
          monthlyFee: 0,
          annualFee: 0,
          maxOrdersPerMonth: 5,
          maxDistricts: 1,
          features: ['Basic Support', 'Limited Leads', '1 District Access'],
          loginScope: 'District',
          minYearsExperience: 1,
          isActive: true
        },
        {
          name: 'Professional',
          monthlyFee: 999,
          annualFee: 9990,
          maxOrdersPerMonth: 20,
          maxDistricts: 3,
          features: ['Priority Support', 'Verified Leads', 'Up to 3 Districts', 'Dedicated Account Manager'],
          loginScope: 'Cluster',
          minYearsExperience: 3,
          isActive: true
        },
        {
          name: 'Enterprise',
          monthlyFee: 2999,
          annualFee: 29990,
          maxOrdersPerMonth: 9999,
          maxDistricts: 10,
          features: ['24/7 Dedicated Support', 'Unlimited Premium Leads', 'Up to 10 Districts', 'Custom Integrations', 'Top Tier Visibility'],
          loginScope: 'State',
          minYearsExperience: 5,
          isActive: true
        }
      ];
      await EpcPlan.insertMany(defaultPlans);
      plans = await EpcPlan.find({ isActive: true }).sort({ monthlyFee: 1 });
    }

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id)
      .select('plan planExpiresAt activeDistricts rating totalRatings districtCapacities');
    const planDetails = await EpcPlan.findOne({ name: epc.plan, isActive: true });
    res.json({
      currentPlan:     epc.plan,
      planExpiresAt:   epc.planExpiresAt,
      activeDistricts: epc.activeDistricts,
      rating:          epc.rating,
      totalRatings:    epc.totalRatings,
      districtCapacities: epc.districtCapacities || [],
      planDetails,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createInstallerUpgradeOrder = async (req, res) => {
  try {
    const { additionalInstallers, targetDistrict } = req.body;
    if (!additionalInstallers || additionalInstallers < 1 || !targetDistrict) {
      return res.status(400).json({ message: 'Invalid installers or district missing' });
    }

    const costPerInstaller = 50000; // Yearly cost
    const totalCost = additionalInstallers * costPerInstaller;
    const amountInPaise = totalCost * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `upg_${Date.now()}`.substring(0, 40)
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      additionalInstallers,
      targetDistrict,
      totalCost
    });
  } catch (error) {
    console.error('Installer upgrade order error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

export const verifyInstallerUpgrade = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      additionalInstallers,
      targetDistrict
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    // Initialize districtCapacities if null
    if (!epc.districtCapacities) epc.districtCapacities = [];
    
    const dIndex = epc.districtCapacities.findIndex(d => d.district === targetDistrict);
    
    if (dIndex > -1) {
      epc.districtCapacities[dIndex].installerCount += parseInt(additionalInstallers);
      epc.districtCapacities[dIndex].weeklyCapacityKw += (parseInt(additionalInstallers) * 25);
    } else {
      epc.districtCapacities.push({
        district: targetDistrict,
        installerCount: 1 + parseInt(additionalInstallers),
        weeklyCapacityKw: 25 + (parseInt(additionalInstallers) * 25)
      });
    }
    
    await epc.save();

    res.json({
      success: true,
      message: 'Installer capacity upgraded successfully!',
      districtCapacities: epc.districtCapacities
    });
  } catch (error) {
    console.error('Installer verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const requestUpgrade = async (req, res) => {
  try {
    const { newPlan, billingCycle } = req.body;
    const validPlans = ['Standard', 'Professional', 'Enterprise'];
    if (!validPlans.includes(newPlan))
      return res.status(400).json({ message: 'Invalid plan' });

    const epc = await EpcPartner.findById(req.epc._id);
    if (epc.plan === newPlan)
      return res.status(400).json({ message: 'Already on this plan' });

    const plan = await EpcPlan.findOne({ name: newPlan, isActive: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    if (epc.yearsOfExperience < plan.minYearsExperience)
      return res.status(400).json({
        message: `Minimum ${plan.minYearsExperience} years experience required for ${newPlan} plan`,
      });

    const amount = billingCycle === 'Annual' ? plan.annualFee : plan.monthlyFee;
    
    // If plan is free (e.g. Standard with 0 fee)
    if (!amount || amount === 0) {
      epc.plan = newPlan;
      const expiry = new Date();
      if (billingCycle === 'Annual') expiry.setFullYear(expiry.getFullYear() + 1);
      else expiry.setMonth(expiry.getMonth() + 1);
      epc.planExpiresAt = expiry;

      await epc.save();
      return res.json({ requiresPayment: false, message: `Plan upgraded to ${newPlan}`, plan: epc.plan, expiresAt: epc.planExpiresAt });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_epc_plan_${epc._id}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      requiresPayment: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      newPlan,
      billingCycle
    });
  } catch (err) {
    console.error("requestUpgrade Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const verifyUpgrade = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, newPlan, billingCycle } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const epc = await EpcPartner.findById(req.epc._id);
    if (!epc) return res.status(404).json({ success: false, message: "EPC not found" });

    epc.plan = newPlan;
    const expiry = new Date();
    if (billingCycle === 'Annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);
    epc.planExpiresAt = expiry;

    await epc.save();

    res.json({ success: true, message: `Payment verified, upgraded to ${newPlan}`, plan: epc.plan, expiresAt: epc.planExpiresAt });
  } catch (error) {
    console.error("verifyUpgrade Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};