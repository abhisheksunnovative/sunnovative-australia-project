/**
 * lightBillScanController.js
 * POST /api/light-bill/scan
 *
 * Country-aware bill scanner:
 * - x-country: australia → uses parseAuBillText() — extracts retailer, suburb, postcode,
 *   quarterly kWh, quarterly bill, solar export, tariff type, meter type + STC calculation
 * - x-country: india (default) → uses parseBillText() — extracts DISCOM, meter category,
 *   consumer number, subsidy estimate (existing India pipeline unchanged)
 */

import ProjectType from '../models/ProjectType.js';
import EligibilitySettings from '../models/EligibilitySettings.js';
import CountryWebsiteSettings from '../models/CountryWebsiteSettings.js';
import fs from 'fs';
import {
  runOcr,
  extractPdfText,
  convertScannedPdfToImages,
  parseBillText,
  deriveRecommendedKw,
  estimateSubsidy,
  parseAuBillText,
  getAuStcZone,
} from '../utils/Ocrextractor.js';
import { calculateSTC } from '../utils/stcCalculator.js';
import { parseAuBillWithGemini } from '../utils/geminiBillExtractor.js';
import ProjectPricing from '../models/ProjectPricing.js';

export const scanLightBill = async (req, res) => {
  try {
    // ── 1. File check ──────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a bill image (JPG/PNG) or PDF.',
      });
    }

    // Save the file to disk so we can return a URL
    const ext = req.file.originalname.split('.').pop();
    const filename = `bill-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const dir = './uploads/bills';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dir + '/' + filename, req.file.buffer);
    const fileUrl = '/uploads/bills/' + filename;


    // ── 2. Extract raw text ────────────────────────────────────────────────
    let rawText;

    if (req.file.mimetype === 'application/pdf') {
      const { text, isScanned } = await extractPdfText(req.file.buffer);
      if (isScanned) {
        try {
          const pageImages = await convertScannedPdfToImages(req.file.buffer);
          if (!pageImages || pageImages.length === 0) {
            return res.status(400).json({
              message:
                'Scanned PDF se koi readable page extract nahi ho paya. ' +
                'Kripya bill ka clear JPG/PNG photo upload karo.',
            });
          }
          const pageTexts = [];
          for (const imgBuffer of pageImages) {
            const pageText = await runOcr(imgBuffer);
            if (pageText && pageText.trim().length > 10) {
              pageTexts.push(pageText);
            }
          }
          if (pageTexts.length === 0) {
            return res.status(400).json({
              message:
                'Scanned PDF me OCR se kuch readable text nahi mila. ' +
                'Kripya bill ka clear, high-quality photo upload karo.',
            });
          }
          rawText = pageTexts.join('\n');
        } catch (pdfImgErr) {
          console.error('Scanned PDF conversion error:', pdfImgErr);
          return res.status(400).json({
            message:
              'Scanned PDF process karne me error aaya. ' +
              'Kripya bill ka JPG/PNG photo upload karo.',
            error: pdfImgErr.message,
          });
        }
      } else {
        rawText = text;
      }
    } else if (req.file.mimetype.startsWith('image/')) {
      rawText = await runOcr(req.file.buffer);
    } else if (req.file.mimetype === 'text/plain') {
      // Text files — for testing: read directly as UTF-8
      rawText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        message: 'Unsupported file type. Please upload JPG, PNG, or PDF.',
      });
    }

    // DEBUG: Save OCR output to file so AI can analyze it
    fs.writeFileSync('last_ocr_text.txt', rawText);

    // ── 3. Country detection ───────────────────────────────────────────────
    const country = req.country || 'india'; // set by extractCountry middleware

    // ══════════════════════════════════════════════════════════════════════
    // ─── AUSTRALIA BILL SCAN PIPELINE ────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════
    if (country === 'australia') {
      let parsed;
      try {
        parsed = await parseAuBillWithGemini(req.file.buffer, req.file.mimetype);
      } catch (geminiErr) {
        console.warn('Gemini extraction failed, falling back to Tesseract+Regex:', geminiErr.message);
        parsed = parseAuBillText(rawText);
      }
      
      // Ensure missing API fields fallback nicely
      if (!parsed.retailer || !parsed.quarterlyBillAmount) {
         console.warn('Gemini returned empty required fields, supplementing with Regex fallback');
         const regexParsed = parseAuBillText(rawText);
         parsed.retailer = parsed.retailer || regexParsed.retailer;
         parsed.quarterlyBillAmount = parsed.quarterlyBillAmount || regexParsed.quarterlyBillAmount;
         parsed.accountNumber = parsed.accountNumber || regexParsed.accountNumber;
         parsed.nmiNumber = parsed.nmiNumber || regexParsed.nmiNumber;
         parsed.postcode = parsed.postcode || regexParsed.postcode;
         parsed.state = parsed.state || regexParsed.state;
         parsed.suburb = parsed.suburb || regexParsed.suburb;
         parsed.dailyKwh = parsed.dailyKwh || regexParsed.dailyKwh;
         parsed.quarterlyKwh = parsed.quarterlyKwh || regexParsed.quarterlyKwh;
      }
      

      // Fetch AU STC settings from CountryWebsiteSettings
      let deemingYears = 5;
      let stcPrice = 38;
      try {
        const auSettings = await CountryWebsiteSettings.findOne({ countryCode: 'AU' }).lean();
        if (auSettings?.stcSettings) {
          deemingYears = auSettings.stcSettings.deemingYears || 5;
          stcPrice     = auSettings.stcSettings.stcPrice || 38;
        }
      } catch (e) {
        console.warn('AU CountryWebsiteSettings fetch failed (using defaults):', e.message);
      }

      // Recommended kW from quarterly usage
      // AU average: 6.5 kWh/day per kW of solar at zone 3
      const zone = getAuStcZone(parsed.postcode || '2000');
      const zoneYieldPerKw = zone === 1 ? 7.5 : zone === 2 ? 7.0 : zone === 3 ? 6.5 : 5.8; // kWh/day/kW

      // Find best project type based on meter category
      let mappedProjectType = 'residential';
      if (parsed.tariffType) {
        const tariff = parsed.tariffType.toLowerCase();
        if (tariff.includes('business') || tariff.includes('commercial')) mappedProjectType = 'commercial';
        if (tariff.includes('farm') || tariff.includes('rural')) mappedProjectType = 'farm-rural';
      }

      // Fetch Live Project Types from DB
      // Note: Use form's selected project type if provided
      let formProjectType = req.body.selectedProjectType || mappedProjectType;
      if (formProjectType === 'default') formProjectType = 'residential';
      
      let availableSizes = [3, 5, 6.6, 10, 13, 15, 20]; // Default fallback
      let projectTypeFound = null;
      try {
        const pt = await ProjectType.findOne({ country: 'australia', projectType: formProjectType, isActive: true }).lean();
        if (pt && pt.availableKw && pt.availableKw.length > 0) {
          availableSizes = pt.availableKw.map(Number).sort((a,b) => a-b);
          projectTypeFound = pt.projectTypeLabel || formProjectType;
        }
      } catch (err) {
        console.warn('Failed to fetch ProjectType sizes', err.message);
      }

      let rawKw = 6.6;

      if (parsed.dailyKwh) {
        rawKw = (parsed.dailyKwh * 1.2) / zoneYieldPerKw;
      } else if (parsed.monthlyBillEquivalent) {
        rawKw = parsed.monthlyBillEquivalent / 100;
      }
      
      // PROJECT TYPE MISMATCH VALIDATION
      // If raw requirement is way higher than the max size in this project type
      let recommendedKw = 6.6;
      if (availableSizes.length > 0 && rawKw > availableSizes[availableSizes.length - 1] * 1.5) {
         return res.status(400).json({ message: `Your requirement (${Math.round(rawKw)} kW) does not match the "${projectTypeFound || formProjectType}" category. Please select the correct Project Type from the top menu (e.g. Commercial Solar) and try again.` });
      }
      
      // Map to nearest available size
      if (availableSizes.length > 0) {
         let closest = availableSizes[0];
         for (let size of availableSizes) {
           if (rawKw <= size) {
             closest = size;
             break;
           }
         }
         if (rawKw > availableSizes[availableSizes.length - 1]) {
           closest = availableSizes[availableSizes.length - 1];
         }
         recommendedKw = closest;
      } else {
         recommendedKw = Math.ceil(rawKw);
      }

      // STC calculation
      const stcCalc = calculateSTC(recommendedKw, zone, new Date().getFullYear(), stcPrice);
      
      // Dynamic Installation Cost (Option A)
      let installCost = Math.round(recommendedKw * 1200); // default
      try {
        const pricingEntry = await ProjectPricing.findOne({ 
          country: 'australia', 
          projectType: 'residential', 
          systemSizeKW: { $gte: recommendedKw } // closest size
        }).sort('systemSizeKW').lean();
        
        if (pricingEntry) {
           // Normalize rate per kw if size isn't exact
           const ratePerKw = pricingEntry.projectPrice / pricingEntry.systemSizeKW;
           installCost = Math.round(recommendedKw * ratePerKw);
        }
      } catch(e) {
        console.warn('Could not fetch project pricing for OCR', e.message);
      }
      
      const netCost = Math.max(500, installCost - stcCalc.totalRebate);

      const confidence = parsed.confidence;
      const response = {
        success: true,
        confidence,
        country: 'australia',
        message: confidence === 'low'
          ? 'Some fields could not be clearly extracted. Please verify details below.'
          : null,

        // ── Extracted bill details (AU-specific) ──
        fileUrl,
        extracted: {
          // Identity
          retailer:         parsed.retailer,
          distributor:      parsed.distributor,
          discom:           parsed.distributor, // alias for frontend
          accountNumber:    parsed.accountNumber,
          nmiNumber:        parsed.nmiNumber,
          consumerName:     parsed.customerName,
          consumerNumber:   parsed.accountNumber, // alias for frontend compatibility

          // Location
          suburb:           parsed.suburb,
          state:            parsed.state,
          postcode:         parsed.postcode,
          detectedState:    parsed.state, // alias for frontend compatibility
          district:         parsed.suburb, // alias for frontend compatibility

          // Billing period
          billingPeriodFrom: parsed.billingPeriodFrom,
          billingPeriodTo:   parsed.billingPeriodTo,
          billingDays:       parsed.billingDays,

          // Usage
          quarterlyKwh:          parsed.quarterlyKwh,
          dailyKwh:              parsed.dailyKwh,
          monthlyKwhEquivalent:  parsed.monthlyKwhEquivalent,
          monthlyUnits:          parsed.monthlyKwhEquivalent, // alias for frontend compat

          // Bill amounts (AU bills are quarterly)
          quarterlyBillAmount:   parsed.quarterlyBillAmount,
          monthlyBillEquivalent: parsed.monthlyBillEquivalent,
          billAmount:            parsed.country === 'australia' ? parsed.quarterlyBillAmount : parsed.monthlyBillEquivalent, // Use quarterly for AU, monthly for IN

          // Solar export
          solarExportKwh:    parsed.solarExportKwh,
          solarExportCredit: parsed.solarExportCredit,

          // Meter & tariff
          tariffType:   parsed.tariffType,
          meterType:    parsed.meterType,
          meterCategory: parsed.tariffType || 'Residential', // alias
        },

        // ── Solar recommendation ──
        recommendedKw,
        monthlyUnitsUsed: parsed.monthlyKwhEquivalent,

        // ── STC calculation ──
        stcInfo: {
          zone,
          zoneLabel: `Zone ${zone}`,
          deemingYears,
          stcPrice,
          stcs:        stcCalc.stcCount,
          stcValue:    stcCalc.totalRebate,
          installCost: installCost,
          netCost:     netCost,
          multiplier:  stcCalc.breakdown.zoneRating,
        },

        // India-compat aliases (frontend may use these)
        subsidyAmount: stcCalc.totalRebate,
        subsidyNote: `${stcCalc.stcCount} STCs × $${stcPrice} = $${stcCalc.totalRebate} rebate (Zone ${zone}, ${deemingYears}-yr deeming)`,
      };

      return res.json(response);
    }

    // ══════════════════════════════════════════════════════════════════════
    // ─── INDIA BILL SCAN PIPELINE (unchanged) ────────────────────────────
    // ══════════════════════════════════════════════════════════════════════

    // ── 4. Parse bill text ─────────────────────────────────────────────────
    const parsed = parseBillText(rawText);

    // ── 5. Load eligibility settings for kwRules + stateOverrides ─────────
    let kwRules = null;
    let stateOverrides = {};
    try {
      const settings = await EligibilitySettings.findOne();
      if (settings?.eligibilityRules) {
        kwRules = settings.eligibilityRules.kwDerivationRules || null;
        stateOverrides = settings.eligibilityRules.stateSubsidyOverrides || {};
      }
    } catch (dbErr) {
      console.warn('EligibilitySettings fetch failed (using defaults):', dbErr.message);
    }

    // ── 6. KW recommendation ───────────────────────────────────────────────
    let { recommendedKw, monthlyUnitsUsed } = deriveRecommendedKw({
      monthlyUnits: parsed.monthlyUnits,
      billAmount: parsed.billAmount,
      kwRules,
    });

    let mappedProjectType = 'residential';
    if (parsed.meterCategory) {
      const mc = parsed.meterCategory.toLowerCase();
      if (mc.includes('commercial') || mc.includes('business')) mappedProjectType = 'commercial';
      if (mc.includes('farm') || mc.includes('rural')) mappedProjectType = 'farm-rural';
    }

    let formProjectType = req.body.selectedProjectType || mappedProjectType;
    if (formProjectType === 'default') formProjectType = 'residential';
    
    let availableSizes = [];
    let projectTypeFound = null;
    try {
      const pt = await ProjectType.findOne({ country: 'india', projectType: formProjectType, isActive: true }).lean();
      if (pt && pt.availableKw && pt.availableKw.length > 0) {
        availableSizes = pt.availableKw.map(Number).sort((a,b) => a-b);
        projectTypeFound = pt.projectTypeLabel || formProjectType;
      }
    } catch (err) {
      console.warn('Failed to fetch ProjectType sizes (India)', err.message);
    }

    // PROJECT TYPE MISMATCH VALIDATION
    if (availableSizes.length > 0 && recommendedKw > availableSizes[availableSizes.length - 1] * 1.5) {
       return res.status(400).json({
           message: `Your requirement (${Math.round(recommendedKw)} kW) does not match the "${projectTypeFound || formProjectType}" category. Please select the correct Project Type from the top menu (e.g. Commercial Solar) and try again.`
       });
    }

    if (availableSizes.length > 0) {
       let closest = availableSizes[0];
       for (let size of availableSizes) {
         if (recommendedKw <= size) {
           closest = size;
           break;
         }
       }
       if (recommendedKw > availableSizes[availableSizes.length - 1]) {
         closest = availableSizes[availableSizes.length - 1];
       }
       recommendedKw = closest;
    }

    // ── 7. Subsidy estimate ────────────────────────────────────────────────
    const { subsidyAmount, note } = recommendedKw
      ? estimateSubsidy(
          recommendedKw,
          parsed.meterCategory,
          parsed.detectedState,
          stateOverrides,
        )
      : { subsidyAmount: null, note: null };

    // ── 8. Low confidence — still return data, warn user ──────────────────
    if (parsed.confidence === 'low') {
      return res.json({
        success: true,
        confidence: 'low',
        country: 'india',
        message:
          'Bill se poori jaankari clearly nahi mil payi. ' +
          'Kripya neeche diye fields manually check/edit kar lo.',
        extracted: parsed,
        recommendedKw,
        monthlyUnitsUsed,
        subsidyAmount,
        subsidyNote: note,
      });
    }

    // ── 9. Success response ────────────────────────────────────────────────
    res.json({
      success: true,
      confidence: parsed.confidence,
      country: 'india',

      fileUrl,
        extracted: {
        discomId:           parsed.discomId,
        detectedState:      parsed.detectedState,
        billFormat:         parsed.billFormat,
        consumerNumber:     parsed.consumerNumber,
        consumerName:       parsed.consumerName,
        district:           parsed.district,
        tariffCode:         parsed.tariffCode,
        tariffDesc:         parsed.tariffDesc,
        meterCategory:      parsed.meterCategory,
        solarEligible:      parsed.solarEligible,
        sanctionedLoad:     parsed.sanctionedLoad,
        monthlyUnits:       parsed.monthlyUnits,
        billAmount:         parsed.billAmount,
        dueAmount:          parsed.dueAmount,
        billStatus:         parsed.billStatus,
        monthsOverdue:      parsed.monthsOverdue,
        billDate:           parsed.billDate,
        dueDate:            parsed.dueDate,
        billingPeriodFrom:  parsed.billingPeriodFrom,
        billingPeriodTo:    parsed.billingPeriodTo,
        rawTextPreview:     parsed.rawTextPreview,
      },

      recommendedKw,
      monthlyUnitsUsed,
      subsidyAmount,
      subsidyNote: note,
    });

  } catch (err) {
    console.error('scanLightBill error:', err);
    res.status(500).json({
      message: 'Bill scan failed. Please try again with a clearer photo or PDF.',
      error: err.message,
    });
  }
};

