/**
 * lightBillEligibilityController.js
 * POST /api/light-bill/check-eligibility
 *
 * Updated to match ocrExtractor.js v4:
 *   - matchMeterCategory handles new category names: 'Residential (LT-1)', 'Commercial (LT-2)' etc.
 *   - solarEligible field from OCR parsed result used directly
 *   - stateSubsidyOverrides from DB used in subsidy calculation
 *   - monthsOverdue comes from OCR parsed result
 */

import EligibilitySettings from '../models/EligibilitySettings.js';
import ProjectPricing from '../models/ProjectPricing.js';
import EpcOrder from '../models/EpcOrder.js';
import { getStateSubsidyData, calcCentralSubsidy } from '../utils/stateSubsidyData.js';

// ── Match OCR category → admin DB category ───────────────────────────────────
// v4 OCR returns: 'Residential (LT-1)', 'Commercial (LT-2)', 'Industrial (HT)', 'Agricultural (LT-5)'
// Admin DB may store: 'Residential (LT-1)', 'Residential', 'LT-1' etc.
// We do a bidirectional includes check so both formats match.
const matchMeterCategory = (ocrCategory, adminCategories) => {
  if (!ocrCategory || ocrCategory === 'Unknown') return null;

  const ocrLower = ocrCategory.toLowerCase();

  return adminCategories.find((c) => {
    const adminLower = (c.category || '').toLowerCase();

    // Exact match
    if (ocrLower === adminLower) return true;

    // One contains the other
    if (ocrLower.includes(adminLower) || adminLower.includes(ocrLower)) return true;

    // Extract base keyword: "residential", "commercial", "industrial", "agricultural"
    const keywords = ['residential', 'commercial', 'industrial', 'agricultural', 'hт', 'lt-1', 'lt-2', 'lt-3', 'lt-5'];
    for (const kw of keywords) {
      if (ocrLower.includes(kw) && adminLower.includes(kw)) return true;
    }

    return false;
  }) || null;
};

export const checkBillEligibility = async (req, res) => {
  try {
    const {
      meterCategory,
      billAmount,
      monthlyUnits,
      dueAmount,
      billStatus,
      monthsOverdue,  // from OCR parsed result (0 if not overdue)
      state,
      solarEligible,  // ← v4 new: from ocrExtractor resolveCat
      overrideKw,     // Optional: custom kW requested by user
    } = req.body;

    if (!billAmount) {
      return res.status(400).json({ message: 'Bill amount required to check eligibility' });
    }
    if (!state) {
      return res.status(400).json({ message: 'State required to calculate subsidy' });
    }

    // ── Load settings from DB ──────────────────────────────────────────────
    let settings = await EligibilitySettings.findOne();
    if (!settings) {
      // Auto-seed defaults on first deployment
      settings = await EligibilitySettings.create({
        projectCategories: [
          { id: 'residential', name: 'Residential Solar', enabled: true, minKW: 1, maxKW: 10, subsidyEligible: true, maxSubsidyAmount: 78000, description: 'Single family homes, apartments' },
          { id: 'commercial',  name: 'Commercial Solar',  enabled: true, minKW: 10, maxKW: 500, subsidyEligible: false, maxSubsidyAmount: 0, description: 'Shops, offices, factories' },
        ],
        inverterTypes: [
          { id: 'string', name: 'String Inverter', enabled: true, efficiency: 97, description: 'Most common, cost-effective' },
        ],
        eligibilityRules: {
          billToKwRanges: [
            { id: 'r1', minBill: 0,    maxBill: 500,   suggestedKW: 0.5, label: 'Very Low' },
            { id: 'r2', minBill: 501,  maxBill: 1000,  suggestedKW: 1,   label: 'Low' },
            { id: 'r3', minBill: 1001, maxBill: 1500,  suggestedKW: 1.5, label: 'Low-Medium' },
            { id: 'r4', minBill: 1501, maxBill: 2500,  suggestedKW: 2,   label: 'Medium' },
            { id: 'r5', minBill: 2501, maxBill: 4000,  suggestedKW: 3,   label: 'Medium-High' },
            { id: 'r6', minBill: 4001, maxBill: 6000,  suggestedKW: 4,   label: 'High' },
            { id: 'r7', minBill: 6001, maxBill: 9000,  suggestedKW: 6,   label: 'Very High' },
            { id: 'r8', minBill: 9001, maxBill: 99999, suggestedKW: 10,  label: 'Ultra High' },
          ],
          meterCategories: [
            { category: 'Residential (LT-1)', eligible: true,  minMonthlyBill: 500,  maxMonthlyBill: 50000  },
            { category: 'Residential',        eligible: true,  minMonthlyBill: 500,  maxMonthlyBill: 50000  },
            { category: 'Commercial (LT-2)',  eligible: true,  minMonthlyBill: 1000, maxMonthlyBill: 500000 },
            { category: 'Industrial (HT)',    eligible: false, minMonthlyBill: 0,    maxMonthlyBill: 0      },
            { category: 'Agricultural',       eligible: false, minMonthlyBill: 0,    maxMonthlyBill: 0      },
          ],
          billStatusRules: {
            paidBillAllowed: true,
            dueBillAllowed: true,
            pendingBillAllowed: false,
            overdueMaxMonths: 2,
          },
          subsidyCriteria: {
            minMonthlyUnits: 50,
            maxMonthlyUnits: 10000,
            pmSuryaGharEligibleCategories: ['Residential (LT-1)', 'Residential'],
            maxSubsidyKW: 3,
          },
          kwDerivationRules: {
            unitsPerKW: 90,
            safetyBuffer: 1.1,
            roundUpToNext: 0.5,
            maxAutoSuggestKW: 10,
          },
          dueAmountThreshold: {
            enabled: true,
            maxAllowedDueAmount: 5000,
            blockIfExceeds: false,
            showWarningIfExceeds: true,
          },
          stateSubsidyOverrides: {},
        },
      });
    }

    const rules = settings.eligibilityRules;
    const reasons = [];
    let isEligible = true;
    let isSubsidyEligible = true;

    // ── 1. Solar Eligible check (from OCR tariff resolution) ──────────────
    // If OCR already determined not eligible (e.g. Industrial/HT), short-circuit
    if (solarEligible === false) {
      isEligible = false;
      isSubsidyEligible = false;
      reasons.push('Is tariff category ke liye solar eligible nahi hai (OCR tariff check).');
    }

    // ── 2. Meter Category check ────────────────────────────────────────────
    const matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);
    if (!matchedCategory) {
      isEligible = false;
      reasons.push(
        `Meter category "${meterCategory || 'Unknown'}" admin settings me configured nahi hai ya bill se detect nahi ho paayi.`
      );
    } else {
      if (!matchedCategory.eligible) {
        isEligible = false;
        reasons.push(`${matchedCategory.category} category solar ke liye eligible nahi hai (admin setting).`);
      }
      if (
        billAmount < matchedCategory.minMonthlyBill ||
        billAmount > matchedCategory.maxMonthlyBill
      ) {
        isEligible = false;
        reasons.push(
          `Bill amount ₹${billAmount} is category ke allowed range (₹${matchedCategory.minMonthlyBill}–₹${matchedCategory.maxMonthlyBill}) se bahar hai.`
        );
      }
    }

    // ── 3. Bill Status check ───────────────────────────────────────────────
    const bsr = rules.billStatusRules || {};
    if (billStatus === 'Paid' && !bsr.paidBillAllowed) {
      isEligible = false;
      reasons.push('Paid bills is admin setting ke hisaab se allowed nahi hain.');
    }
    if (billStatus === 'Overdue') {
      if (!bsr.dueBillAllowed && !bsr.pendingBillAllowed) {
        isEligible = false;
        reasons.push('Overdue/pending bills allowed nahi hain (admin setting).');
      }

      // Months overdue enforcement
      const monthsOverdueNum = Number(monthsOverdue) || 0;
      if (bsr.overdueMaxMonths !== undefined && monthsOverdueNum > bsr.overdueMaxMonths) {
        isEligible = false;
        reasons.push(
          `Bill ${monthsOverdueNum} mahine se overdue hai, jo allowed limit (${bsr.overdueMaxMonths} mahine) se zyada hai.`
        );
      }
    }

    // ── 4. Due Amount Threshold check ──────────────────────────────────────
    const dat = rules.dueAmountThreshold || {};
    let dueAmountWarning = null;
    if (dat.enabled && dueAmount > dat.maxAllowedDueAmount) {
      if (dat.blockIfExceeds) {
        isEligible = false;
        reasons.push(
          `Due amount ₹${dueAmount} allowed limit ₹${dat.maxAllowedDueAmount} se zyada hai — application block.`
        );
      } else if (dat.showWarningIfExceeds) {
        dueAmountWarning =
          `Due amount ₹${dueAmount} threshold (₹${dat.maxAllowedDueAmount}) se zyada hai. ` +
          `Apply kar sakte ho, lekin verification ke time due clear karna pad sakta hai.`;
      }
    }

    // ── 5. Suggested KW — from Bill → KW Mapping ──────────────────────────
    const ranges = rules.billToKwRanges || [];
    const matchedRange = ranges.find((r) => billAmount >= r.minBill && billAmount <= r.maxBill);
    let suggestedKW = matchedRange ? matchedRange.suggestedKW : 1;

    // ── 6. Units-derived KW (more accurate if units available) ────────────
    const kdr = rules.kwDerivationRules || {};
    let unitsDerivedKw = null;
    if (monthlyUnits && kdr.unitsPerKW) {
      const raw = (monthlyUnits / kdr.unitsPerKW) * (kdr.safetyBuffer || 1);
      const step = kdr.roundUpToNext || 0.5;
      unitsDerivedKw = Math.min(
        Math.ceil(raw / step) * step,
        kdr.maxAutoSuggestKW || 10
      );
      // Prefer units-derived KW if available
      suggestedKW = unitsDerivedKw;
    }

    if (overrideKw && overrideKw > 0) {
      suggestedKW = Number(overrideKw);
    }

    // ── 7. Subsidy Criteria check ──────────────────────────────────────────
    const sc = rules.subsidyCriteria || {};
    if (
      monthlyUnits &&
      (monthlyUnits < sc.minMonthlyUnits || monthlyUnits > sc.maxMonthlyUnits)
    ) {
      isSubsidyEligible = false;
      reasons.push(
        `Monthly units ${monthlyUnits} subsidy ke allowed range (${sc.minMonthlyUnits}–${sc.maxMonthlyUnits}) se bahar hai — ` +
        `panel lagwa sakte ho, subsidy nahi milegi.`
      );
    }

    if (
      matchedCategory &&
      Array.isArray(sc.pmSuryaGharEligibleCategories) &&
      !sc.pmSuryaGharEligibleCategories.includes(matchedCategory.category)
    ) {
      isSubsidyEligible = false;
      reasons.push(
        `${matchedCategory.category} PM Surya Ghar subsidy list me nahi hai — ` +
        `sirf ${sc.pmSuryaGharEligibleCategories.join(', ')} eligible hain.`
      );
    }

    // ── 8. Subsidy calculation ─────────────────────────────────────────────
    const subsidyCapKw = Math.min(suggestedKW, sc.maxSubsidyKW || 3);
    let centralSubsidy = 0;
    let stateSubsidyAmount = 0;

    const stateInfo = getStateSubsidyData(state, rules?.stateSubsidies || []);

    if (isEligible && isSubsidyEligible) {
      centralSubsidy = calcCentralSubsidy(subsidyCapKw, rules?.centralSubsidyTiers || []);
      if (stateInfo) {
        stateSubsidyAmount = Math.min(
          stateInfo.stateSubsidyPerKW * subsidyCapKw,
          stateInfo.stateSubsidyMax
        );
      }
    }

    const totalSubsidy = centralSubsidy + stateSubsidyAmount;

    // Fetch pricing from ProjectPricing model (Generalised for all countries/projectTypes)
    const countryStr = req.headers['x-country'] || 'india';
    const projTypeStr = req.body.projectType || (matchedCategory?.category?.includes('Residential') ? 'residential' : 'commercial');
    let basePrice = suggestedKW * 60000; // default fallback
    
    try {
      const pricingObj = await ProjectPricing.findOne({
        country: countryStr.toLowerCase(),
        projectType: { $regex: new RegExp(projTypeStr, 'i') },
        systemSizeKW: suggestedKW
      }).sort({ createdAt: -1 });

      if (pricingObj) {
        if (pricingObj.pricingResponsibility === 'EPC') {
            // Pull the price from the specific EpcOrder if a mobile/email is provided and an order exists
            if (req.body.mobile || req.body.email) {
                const epcOrder = await EpcOrder.findOne({
                    $or: [{ customerMobile: req.body.mobile }, { customerEmail: req.body.email }]
                }).sort({ createdAt: -1 });
                
                if (epcOrder && epcOrder.epcSubmittedPrice) {
                    basePrice = epcOrder.epcSubmittedPrice;
                } else if (pricingObj.projectPrice) {
                    basePrice = pricingObj.projectPrice; // Fallback to company suggested rate
                }
            } else if (pricingObj.projectPrice) {
               basePrice = pricingObj.projectPrice;
            }
        } else if (pricingObj.projectPrice) {
            basePrice = pricingObj.projectPrice;
        }
      }
    } catch (pricingErr) {
      console.warn("Could not fetch ProjectPricing in eligibility check:", pricingErr);
    }

    // ── 9. Response ────────────────────────────────────────────────────────
    res.json({
      success: true,
      isEligible,
      isSubsidyEligible,
      reasons,
      dueAmountWarning,
      matchedMeterCategory: matchedCategory?.category || null,
      suggestedKW,
      unitsDerivedKw,
      subsidy: {
        capKw:        subsidyCapKw,
        central:      centralSubsidy,
        state:        stateSubsidyAmount,
        total:        totalSubsidy,
        stateScheme:  stateInfo?.stateScheme  || null,
        stateAgency:  stateInfo?.agency       || null,
      },
      estimatedInvestment: {
        approxSystemCost:  basePrice,
        netAfterSubsidy:   Math.max(10000, basePrice - totalSubsidy),
      },
    });

  } catch (err) {
    console.error('checkBillEligibility error:', err);
    res.status(500).json({
      message: 'Server error while checking eligibility',
      error: err.message,
    });
  }
};
