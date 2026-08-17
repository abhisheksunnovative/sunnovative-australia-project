import express from 'express';
import { sendOtp, verifyOtp, getMe, updateProfile, setPin, loginWithPin } from '../controllers/customerAuthController.js';
import { getMyProjects, getProjectDetail, uploadDocument, applyForProject, payEscrow, payToken, getAvailableEpcs, completeStep, signStcForm, rateEpc, updateProjectDetail, selectRecommendedEpc } from '../controllers/customerProjectController.js';
import { getCustomerNotifications } from '../controllers/notificationController.js';
import { protectCustomer } from '../middleware/protectCustomer.js';
import upload from '../middleware/upload.js';
import EpcPartner from '../models/EpcPartner.js';
import Brand from '../models/Brand.js';
import InstallerRankingSettings from '../models/InstallerRankingSettings.js';
import EligibilitySettings  from '../models/EligibilitySettings.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import CountryWebsiteSettings from '../models/CountryWebsiteSettings.js';
import ProjectPricing from '../models/ProjectPricing.js';
import { extractCountry } from '../middleware/countryMiddleware.js';

const router = express.Router();
router.use(extractCountry);

// Auth — public
router.post('/auth/send-otp',       sendOtp);
router.post('/auth/verify-otp',     verifyOtp);
router.post('/auth/set-pin',        setPin);
router.post('/auth/login-with-pin', loginWithPin);

// Profile — protected
router.get ('/auth/me',          protectCustomer, getMe);
router.put ('/auth/profile',     protectCustomer, updateProfile);

// Projects — protected
router.get ('/projects',                          protectCustomer, getMyProjects);
router.get ('/projects/:id',                      protectCustomer, getProjectDetail);
router.put ('/projects/:id',                      protectCustomer, upload.single('rooftopPhoto'), updateProjectDetail);
router.post('/projects',                          protectCustomer, upload.single('rooftopPhoto'), applyForProject);
router.post('/projects/:id/documents',            protectCustomer, upload.single('file'), uploadDocument);
router.post('/projects/:id/pay-token',            protectCustomer, payToken);
router.post('/projects/:id/pay-escrow',           protectCustomer, payEscrow);
router.post('/projects/:id/complete-step',        protectCustomer, upload.single('evidence'), completeStep);
router.post('/projects/:id/sign-stc',             protectCustomer, signStcForm);


router.post('/projects/:id/select-epc',           protectCustomer, selectRecommendedEpc);
router.post('/projects/:id/rate-epc',             protectCustomer, rateEpc);
router.get ('/epcs',                              protectCustomer, getAvailableEpcs);
router.get ('/notifications',                     protectCustomer, getCustomerNotifications);

// ── Public data (no auth needed) ─────────────────────────────────────────────

// EPC partners public list (filtered, safe fields only)
router.get('/public/epc-partners', async (req, res) => {
  try {
    const { district, projectType, brands } = req.query;
    const filter = { onboardingStatus: 'Active', isActive: true };
    if (district) filter.activeDistricts = district;
    if (projectType) filter.qualifiedProjectTypes = projectType;

    // Filter by brands if provided (array of brand names)
    if (brands && Array.isArray(brands) && brands.length > 0) {
      const brandDocs = await Brand.find({ name: { $in: brands } });
      const brandIds = brandDocs.map(b => b._id);
      filter.$or = [
        { 'brandOfferings.solarBrands': { $in: brandIds } },
        { 'brandOfferings.inverterBrands': { $in: brandIds } }
      ];
    }

    let epcs = await EpcPartner.find(filter)
      .select('companyName city district state plan rating totalRatings yearsOfExperience qualifiedProjectTypes activeDistricts onTimeCompletionPercent trustBadge');

    // Fetch ranking settings from EpcSystemSettings
    const { default: EpcSystemSettings } = await import('../models/EpcSystemSettings.js');
    const sysSettings = await EpcSystemSettings.getSingleton();
    let limit = 5;
    let priorities = ['trustBadge', 'rating'];

    if (sysSettings.regionRules) {
      const countryStr = req.country || 'australia';
      const stateStr = req.query.state || 'Victoria';
      const projectTypeStr = req.query.projectType || 'residential';
      const rule = sysSettings.regionRules.find(r => 
         r.country.toLowerCase() === countryStr.toLowerCase() && 
         r.state.toLowerCase() === stateStr.toLowerCase() && 
         r.projectType === projectTypeStr
      ) || sysSettings.regionRules.find(r => 
         r.country.toLowerCase() === countryStr.toLowerCase() && 
         r.state.toLowerCase() === 'all' && 
         r.projectType === projectTypeStr
      );
      if (rule) {
         limit = rule.customerSelectEpcSettings?.totalEpcCards || limit;
      }
    }

    // Manual sort based on priorities since trustBadge is an object and leads might not be in DB simply
    epcs.sort((a, b) => {
      for (const p of priorities) {
        if (p === 'trustBadge') {
          const aTrust = a.trustBadge?.status === 'Approved' ? 1 : 0;
          const bTrust = b.trustBadge?.status === 'Approved' ? 1 : 0;
          if (aTrust !== bTrust) return bTrust - aTrust;
        } else if (p === 'rating') {
          if (a.rating !== b.rating) return (b.rating || 0) - (a.rating || 0);
        }
        // Could handle other priorities like lowest leads received if the field existed
      }
      return 0;
    });

    epcs = epcs.slice(0, limit);

    res.json({ success: true, count: epcs.length, data: epcs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DYNAMIC Solar Packages — built from OrderJourneySettings + CountryWebsiteSettings + EligibilitySettings ──
router.get('/public/solar-packages', async (req, res) => {
  try {
    const country = req.country || 'india'; // e.g. 'australia', 'india'

    // Map country string to countryCode for CountryWebsiteSettings
    const countryCodeMap = { australia: 'AU', india: 'IN', new_zealand: 'NZ', uk: 'UK', us: 'US' };
    const countryCode = countryCodeMap[country] || 'IN';

    // 1. Fetch country-specific settings in parallel
    const [eligibilitySettings, journeySettings, countryWebSettings, projectPricings] = await Promise.all([
      EligibilitySettings.findOne({ country }).lean(),
      OrderJourneySettings.findOne({ country }).lean(),
      CountryWebsiteSettings.findOne({ countryCode }).lean(),
      ProjectPricing.find({ country }).lean()
    ]);

    // 2. Subsidy helpers — country-specific tiers
    const tiers = eligibilitySettings?.eligibilityRules?.centralSubsidyTiers || [];
    const calcCentralSubsidy = (kw) => {
      if (tiers.length === 0) return 0; // Australia etc. — no subsidy tiers
      let subsidy = 0;
      let remaining = kw;
      for (const tier of [...tiers].sort((a, b) => a.maxKW - b.maxKW)) {
        if (remaining <= 0) break;
        const kwInTier = Math.min(remaining, tier.maxKW);
        subsidy += kwInTier * (tier.ratePerKW || 0) + (tier.fixedBaseAmount || 0);
        remaining -= kwInTier;
      }
      return subsidy;
    };

    // 3. State-subsidy overrides (India specific)
    const stateOverrides = {};
    if (eligibilitySettings?.eligibilityRules?.stateSubsidies) {
      eligibilitySettings.eligibilityRules.stateSubsidies.forEach(ss => {
        stateOverrides[ss.state] = ss.stateSubsidyMax;
      });
    }

    // 4. Build packages from enabled OrderJourney project types
    const enabledJourneys = (journeySettings?.journeys || []).filter(j => j.enabled !== false);

    const isAustralia = country === 'australia';
    const isIndia = country === 'india';
    
    // Default base rate fallback
    const defaultBaseRatePerKw = isAustralia ? 1200 : isIndia ? 60000 : 1000;
    const unitsPerKwPerMonth = eligibilitySettings?.eligibilityRules?.kwDerivationRules?.unitsPerKW || (isAustralia ? 130 : 90);

    const packages = [];

    for (const journey of enabledJourneys) {
      const { projectType, projectTypeLabel } = journey;
      const ptConfig = countryWebSettings?.projectTypeConfigs?.find(c => c.type === projectType);
      const maxKwLimit = ptConfig?.maxKwLimit || 10;

      const typeLower = (projectType || '').toLowerCase();
      const isCommercial = ['commercial', 'industrial', 'group', 'common-meter'].includes(typeLower);
      const isResidential = ['residential', 'apartment', 'society'].includes(typeLower);

      let kwOptions = [];
      if (isResidential) {
        kwOptions = [1, 2, 3].filter(k => k <= maxKwLimit);
        if (maxKwLimit >= 5) kwOptions.push(5);
      } else if (isCommercial) {
        kwOptions = [5, 10].filter(k => k <= maxKwLimit);
        if (maxKwLimit >= 20) kwOptions.push(20);
        if (maxKwLimit >= 50) kwOptions.push(50);
      } else {
        kwOptions = [3, 10].filter(k => k <= maxKwLimit);
      }

      const badgeMap = { 0: null, 1: 'Popular', 2: 'Max Subsidy' };

      kwOptions.forEach((kw, idx) => {
        let installCost = null;
        let pricingDependentOnEPC = false;

        if (isAustralia) {
          pricingDependentOnEPC = true;
          // In Australia, EPC sets the pricing, so we don't display a static install cost upfront.
        } else {
          // Option A: Dynamically fetch install cost from ProjectPricing if available
          const pricingEntry = projectPricings.find(p => p.projectType === projectType && p.systemSizeKW === kw);
          installCost = pricingEntry ? pricingEntry.projectPrice : Math.round(kw * defaultBaseRatePerKw);
        }
        
        packages.push({
          id: `${projectType}-${kw}kw`,
          kw,
          name: `${ptConfig?.heroTitle || (projectTypeLabel || projectType)} ${kw}kW`,
          desc: ptConfig?.heroSubtitle || (isResidential
            ? `${kw <= 2 ? 'Small home' : kw <= 3 ? 'Medium home' : 'Large property'} ke liye ideal`
            : `${projectTypeLabel || projectType} solar — ${kw}kW`),
          centralSubsidy: calcCentralSubsidy(kw),
          installCost,
          pricingDependentOnEPC,
          units: Math.round(kw * unitsPerKwPerMonth),
          suitable: [projectTypeLabel || projectType],
          projectType,
          badge: badgeMap[idx] || null,
        });
      });
    }

    // 5. Fallback: no journeys configured → legacy India hardcoded packages
    if (packages.length === 0 && isIndia) {
      const cf = (kw) => { let s = 0, r = kw; for (const t of [...tiers].sort((a, b) => a.maxKW - b.maxKW)) { if (r <= 0) break; s += Math.min(r, t.maxKW) * t.ratePerKW + t.fixedBaseAmount; r -= t.maxKW; } return s || (kw === 1 ? 30000 : kw === 2 ? 60000 : 78000); };
      packages.push(
        { id: '1kw',  kw: 1,  name: 'Starter Solar',  desc: '1-2 BHK apartments ke liye', centralSubsidy: cf(1), installCost: 65000,  units: 90,  suitable: ['Residential Solar'], projectType: 'residential', badge: null },
        { id: '2kw',  kw: 2,  name: 'Family Solar',   desc: '2-3 BHK homes ke liye',      centralSubsidy: cf(2), installCost: 115000, units: 180, suitable: ['Residential Solar'], projectType: 'residential', badge: 'Popular' },
        { id: '3kw',  kw: 3,  name: 'Premium Solar',  desc: '3-4 BHK, AC wale ghar',       centralSubsidy: cf(3), installCost: 155000, units: 270, suitable: ['Residential Solar'], projectType: 'residential', badge: 'Max Subsidy' },
        { id: '5kw',  kw: 5,  name: 'Business Solar', desc: 'Shops, offices, clinics',     centralSubsidy: 0,     installCost: 230000, units: 450, suitable: ['Commercial Solar'],  projectType: 'commercial',  badge: null },
        { id: '10kw', kw: 10, name: 'Commercial Pro', desc: 'Factories, warehouses',        centralSubsidy: 0,     installCost: 420000, units: 900, suitable: ['Commercial Solar'],  projectType: 'commercial',  badge: 'Best ROI' },
      );
    }

    const minBookingDays = journeySettings?.globalSettings?.minBookingDays || 5;
    res.json({ success: true, packages, stateOverrides, minBookingDays, country, countryCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
