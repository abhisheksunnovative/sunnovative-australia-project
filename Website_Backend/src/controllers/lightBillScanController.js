/**
 * lightBillScanController.js
 * POST /api/light-bill/scan
 *
 * Updated to match ocrExtractor.js v4:
 *   - discomId + detectedState in response
 *   - solarEligible from resolveCat (via parseBillText)
 *   - kwRules passed to deriveRecommendedKw from DB settings
 *   - estimateSubsidy gets detectedState + stateOverrides
 *   - billingPeriodLabel replaced by billingPeriodFrom/To
 *   - tariffDesc added to response
 */

import EligibilitySettings from '../models/EligibilitySettings.js';
import fs from 'fs';
import {
  runOcr,
  extractPdfText,
  convertScannedPdfToImages,
  parseBillText,
  deriveRecommendedKw,
  estimateSubsidy,
} from '../utils/Ocrextractor.js';

export const scanLightBill = async (req, res) => {
  try {
    // ── 1. File check ──────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a bill image (JPG/PNG) or PDF.',
      });
    }

    // ── 2. Extract raw text ────────────────────────────────────────────────
    let rawText;

    if (req.file.mimetype === 'application/pdf') {
      const { text, isScanned } = await extractPdfText(req.file.buffer);
      if (isScanned) {
        // v5: Instead of rejecting, convert scanned PDF pages to images
        // and run Tesseract OCR on each page
        try {
          const pageImages = await convertScannedPdfToImages(req.file.buffer);
          if (!pageImages || pageImages.length === 0) {
            return res.status(400).json({
              message:
                'Scanned PDF se koi readable page extract nahi ho paya. ' +
                'Kripya bill ka clear JPG/PNG photo upload karo.',
            });
          }
          // OCR each page and combine text (most bills are 1-2 pages)
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
    } else {
      return res.status(400).json({
        message: 'Unsupported file type. Please upload JPG, PNG, or PDF.',
      });
    }

    // DEBUG: Save OCR output to file so AI can analyze it
    fs.writeFileSync('last_ocr_text.txt', rawText);

    // ── 3. Parse bill text ─────────────────────────────────────────────────
    const parsed = parseBillText(rawText);

    // ── 4. Load eligibility settings for kwRules + stateOverrides ─────────
    let kwRules = null;
    let stateOverrides = {};
    try {
      const settings = await EligibilitySettings.findOne();
      if (settings?.eligibilityRules) {
        kwRules = settings.eligibilityRules.kwDerivationRules || null;
        stateOverrides = settings.eligibilityRules.stateSubsidyOverrides || {};
      }
    } catch (dbErr) {
      // DB error won't block scan — just use defaults
      console.warn('EligibilitySettings fetch failed (using defaults):', dbErr.message);
    }

    // ── 5. KW recommendation ───────────────────────────────────────────────
    const { recommendedKw, monthlyUnitsUsed } = deriveRecommendedKw({
      monthlyUnits: parsed.monthlyUnits,
      billAmount: parsed.billAmount,
      kwRules,                          // ← v4: passes DB-driven rules
    });

    // ── 6. Subsidy estimate ────────────────────────────────────────────────
    const { subsidyAmount, note } = recommendedKw
      ? estimateSubsidy(
          recommendedKw,
          parsed.meterCategory,
          parsed.detectedState,         // ← v4: state-aware subsidy
          stateOverrides,
        )
      : { subsidyAmount: null, note: null };

    // ── 7. Low confidence — still return data, warn user ──────────────────
    if (parsed.confidence === 'low') {
      return res.json({
        success: true,
        confidence: 'low',
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

    // ── 8. Success response ────────────────────────────────────────────────
    res.json({
      success: true,
      confidence: parsed.confidence,   // 'high' | 'medium'

      // ── Bill details ───────────────────────────────────────────────────
      extracted: {
        // Identity
        discomId:           parsed.discomId,
        detectedState:      parsed.detectedState,
        billFormat:         parsed.billFormat,

        // Consumer
        consumerNumber:     parsed.consumerNumber,
        consumerName:       parsed.consumerName,
        district:           parsed.district,

        // Meter / Tariff
        tariffCode:         parsed.tariffCode,
        tariffDesc:         parsed.tariffDesc,        // ← v4 new field
        meterCategory:      parsed.meterCategory,
        solarEligible:      parsed.solarEligible,     // ← v4 new field
        sanctionedLoad:     parsed.sanctionedLoad,

        // Consumption
        monthlyUnits:       parsed.monthlyUnits,

        // Amounts
        billAmount:         parsed.billAmount,
        dueAmount:          parsed.dueAmount,
        billStatus:         parsed.billStatus,
        monthsOverdue:      parsed.monthsOverdue,

        // Dates
        billDate:           parsed.billDate,
        dueDate:            parsed.dueDate,
        billingPeriodFrom:  parsed.billingPeriodFrom, // ← v4: replaces billingPeriodLabel
        billingPeriodTo:    parsed.billingPeriodTo,   // ← v4: replaces billingPeriodLabel

        rawTextPreview:     parsed.rawTextPreview,
      },

      // ── Solar recommendation ─────────────────────────────────────────
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
