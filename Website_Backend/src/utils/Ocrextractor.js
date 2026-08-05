/**
 * utils/ocrExtractor.js — v5 (Enhanced DISCOM-wise + Hindi + Multi-state)
 * ─────────────────────────────────────────────────────────────────
 * Supports:
 *   - PGVCL, DGVCL, UGVCL, MGVCL (Gujarat)
 *   - MSEDCL (Maharashtra)
 *   - PVVNL, DVVNL, MVVNL, PuVVNL (UP — Hindi bills)
 *   - BESCOM (Karnataka)
 *   - TNEB/TANGEDCO (Tamil Nadu)
 *   - WBSEDCL (West Bengal)
 *   - Rajasthan DISCOMs (JDVVNL, AVVNL, JVVNL)
 *   - Generic fallback for unknown DISCOMs
 *
 * v5 Fixes over v4:
 *   1. PURVANCHAL VIDYUT now detected (was POORVANCHAL — wrong spelling)
 *   2. deriveRecommendedKw accepts and uses kwRules from DB
 *   3. estimateSubsidy accepts detectedState + stateOverrides for state-wise subsidy
 *   4. parseBillText returns solarEligible, tariffDesc, district, billFormat
 *   5. DISCOM-context-aware meter category fallback (if regex fails, uses load + DISCOM)
 *   6. Improved PGVCL/PVVNL tariff code detection
 *   7. "Meter Units", "Net Billed Unit", "KWH" patterns for units extraction
 *   8. "Payable by Due date", "Net Current Bill" patterns for bill amount
 *   9. Consumer number: Account No / खाता संo / C/h No patterns, 8-15 digits
 *  10. District extraction from address, PIN code, known cities
 *  11. Tariff code description mapping (RGPU → "Residential General Purpose Urban")
 *  12. OCR noise handling: LMV)1, RG P U, spaced/merged codes
 */

import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse-fork';
import { pdf as pdfToImages } from 'pdf-to-img';
import { getStateSubsidyData } from './stateSubsidyData.js';

// ── OCR — Image bills ────────────────────────────────────────────────────────
// Uses eng+hin so both English and Hindi bills parse correctly
export const runOcr = async (imageBuffer) => {
  const { data } = await Tesseract.recognize(imageBuffer, 'eng+hin', {
    logger: () => {}, // suppress progress logs
  });
  return data.text;
};

// ── PDF bills — direct text extraction ──────────────────────────────────────
export const extractPdfText = async (pdfBuffer) => {
  try {
    const result = await pdfParse(pdfBuffer);
    const text = (result.text || '').trim();
    if (text.length < 30) return { text: '', isScanned: true };
    return { text, isScanned: false };
  } catch (error) {
    throw new Error(`PDF Parsing failed: ${error.message}`);
  }
};

// ── Scanned PDF → Image conversion ──────────────────────────────────────────
// Renders each PDF page as a high-resolution PNG image buffer so Tesseract can
// OCR it. Used when extractPdfText detects a scanned/image-based PDF.
export const convertScannedPdfToImages = async (pdfBuffer) => {
  try {
    const images = [];
    const pages = await pdfToImages(pdfBuffer, { scale: 2.0 });
    for await (const pageImage of pages) {
      images.push(pageImage);
    }
    return images; // Array of PNG Buffers (one per page)
  } catch (error) {
    throw new Error(`Scanned PDF to image conversion failed: ${error.message}`);
  }
};

// ── Date parser — handles all Indian bill date formats ───────────────────────
const MONTH_MAP = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const parseIndianDate = (str) => {
  if (!str) return null;
  const s = str.trim().replace(/\./g, '-').replace(/\//g, '-').toUpperCase();

  // 12-JUN-2026 or 12-JUN-26
  const m1 = s.match(/^(\d{1,2})-([A-Z]{3})-(\d{2,4})$/);
  if (m1) {
    const mon = MONTH_MAP[m1[2]];
    if (mon !== undefined) {
      const yr = m1[3].length === 2 ? 2000 + Number(m1[3]) : Number(m1[3]);
      return new Date(yr, mon, Number(m1[1]));
    }
  }

  // DD-MM-YYYY or DD-MM-YY
  const m2 = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (m2) {
    const yr = m2[3].length === 2 ? 2000 + Number(m2[3]) : Number(m2[3]);
    return new Date(yr, Number(m2[2]) - 1, Number(m2[1]));
  }

  return null;
};

// ── DISCOM detection ─────────────────────────────────────────────────────────
const DISCOM_LIST = [
  { id: 'PGVCL', pattern: /PGVCL|PASCHIM\s*GUJARAT\s*VIJ/i,                                state: 'Gujarat'       },
  { id: 'DGVCL', pattern: /DGVCL|DAKSHIN\s*GUJARAT\s*VIJ/i,                                state: 'Gujarat'       },
  { id: 'UGVCL', pattern: /UGVCL|UTTAR\s*GUJARAT\s*VIJ/i,                                  state: 'Gujarat'       },
  { id: 'MGVCL', pattern: /MGVCL|MADHYA\s*GUJARAT\s*VIJ/i,                                 state: 'Gujarat'       },
  { id: 'MSEDCL',pattern: /MSEDCL|MAHARASHTRA\s*STATE\s*ELEC/i,                            state: 'Maharashtra'   },
  { id: 'PVVNL', pattern: /PVVNL|PASCHIMANCHAL\s*VIDYUT/i,                                 state: 'Uttar Pradesh' },
  { id: 'DVVNL', pattern: /DVVNL|DAKSHINANCHAL\s*VIDYUT/i,                                 state: 'Uttar Pradesh' },
  { id: 'MVVNL', pattern: /MVVNL|MADHYANCHAL\s*VIDYUT/i,                                   state: 'Uttar Pradesh' },
  // v5 FIX: was "POORVANCHAL" — actual company name is "PURVANCHAL"
  { id: 'PuVVNL',pattern: /PuVVNL|PUVVNL|PURVANCHAL\s*VIDYUT|POORVANCHAL\s*VIDYUT/i,     state: 'Uttar Pradesh' },
  { id: 'UPPCL', pattern: /UPPCL|uppcl\.org/i,                                              state: 'Uttar Pradesh' },
  { id: 'BESCOM',pattern: /BESCOM|BANGALORE\s*ELECTRICITY/i,                                state: 'Karnataka'     },
  { id: 'TNEB',  pattern: /TNEB|TANGEDCO/i,                                                 state: 'Tamil Nadu'    },
  { id: 'BSES',  pattern: /BSES|TATA\s*POWER\s*DELHI/i,                                    state: 'Delhi'         },
  { id: 'WBSEDCL',pattern:/WBSEDCL/i,                                                       state: 'West Bengal'   },
  // v5: Added Rajasthan, Chhattisgarh, Telangana, AP DISCOMs
  { id: 'JDVVNL',pattern: /JDVVNL|JODHPUR\s*VIDYUT/i,                                     state: 'Rajasthan'     },
  { id: 'AVVNL', pattern: /AVVNL|AJMER\s*VIDYUT/i,                                         state: 'Rajasthan'     },
  { id: 'JVVNL', pattern: /JVVNL|JAIPUR\s*VIDYUT/i,                                        state: 'Rajasthan'     },
  { id: 'CSPDCL',pattern: /CSPDCL/i,                                                        state: 'Chhattisgarh'  },
  { id: 'TSSPDCL',pattern:/TSSPDCL|TSNPDCL/i,                                              state: 'Telangana'     },
  { id: 'APSPDCL',pattern:/APSPDCL|APEPDCL/i,                                              state: 'Andhra Pradesh'},
];

const detectDiscom = (text) => {
  for (const d of DISCOM_LIST) {
    if (d.pattern.test(text)) return d;
  }
  return { id: 'UNKNOWN', state: null };
};

// ── METER CATEGORY detection ─────────────────────────────────────────────────
// Each DISCOM uses different tariff codes / names for meter categories.
// We match tariff codes first (most reliable), then fall back to text keywords.

const TARIFF_TO_CATEGORY = [
  // ── Gujarat (PGVCL / DGVCL / UGVCL / MGVCL) ──────────────────────────────
  // LT Residential — v5: removed strict \b so OCR noise is tolerated
  { pattern: /RGPU|RGPR/i,                                     category: 'Residential (LT-1)' },
  { pattern: /\bLT[-\s.]?1[A-Z]?\b/i,                          category: 'Residential (LT-1)' },
  // LT Commercial / Non-Domestic
  { pattern: /LGPU|LGPR/i,                                     category: 'Commercial (LT-2)'  },
  // LT Industrial
  { pattern: /\b(LT[-\s.]?3[A-Z]?|LT[-\s.]?4)\b/i,           category: 'Industrial (LT-3)'  },
  // LT Agricultural
  { pattern: /AGRU|AGRR/i,                                     category: 'Agricultural (LT-5)'},
  { pattern: /\bLT[-\s.]?5[A-Z]?\b/i,                          category: 'Agricultural (LT-5)'},
  // HT Industrial / Commercial
  { pattern: /\bHT[-\s.]?[1-9]\b|\bHT[A-Z]\b/i,               category: 'HT Industrial'      },

  // ── Maharashtra (MSEDCL) ──────────────────────────────────────────────────
  { pattern: /\bRGH\b|\bResidential\s*General\b/i,             category: 'Residential (LT-1)' },
  { pattern: /\bCOML\b|\bNon[-\s]?Domestic\b/i,                category: 'Commercial (LT-2)'  },
  { pattern: /\bLT[-\s]?IND\b/i,                                category: 'Industrial (LT-3)'  },
  { pattern: /\bAGR\b|\bAGRI\b/i,                               category: 'Agricultural (LT-5)'},

  // ── UP DISCOMs (PVVNL/DVVNL/MVVNL/PuVVNL) ───────────────────────────────
  // UP Tariff Schedules: LMV-1 = Domestic, LMV-2 = Commercial, LMV-5 = Agri
  // v5 FIX: OCR may read "LMV1", "LMV-1", "LMV)1", "LMV 1", "(LMV)1", "LMV| 1", "LMV I"
  // Extreme OCR noise: "Lore ER Redemialf" = LMV1 PU Residential
  { pattern: /LMV[)\s\-.|]*[1Il]|Redemialf|Lore\s*ER/i,              category: 'Residential (LT-1)' },
  { pattern: /LMV[)\s\-.|]*2/i,                                  category: 'Commercial (LT-2)'  },
  { pattern: /LMV[)\s\-.|]*[34]/i,                               category: 'Industrial (LT-3)'  },
  { pattern: /LMV[)\s\-.|]*5|NLMV[-\s]?5/i,                     category: 'Agricultural (LT-5)'},
  { pattern: /\bHV[-\s]?[123]\b|\bEHV\b/i,                      category: 'HT Industrial'      },
  // v5: UP bills often have "PU Residential" or "Residential / Domestic"
  { pattern: /PU\s*Residential/i,                                category: 'Residential (LT-1)' },

  // ── Karnataka (BESCOM) ────────────────────────────────────────────────────
  { pattern: /\bLT[-\s]?2[AB]\b/i,                              category: 'Residential (LT-1)' },

  // ── Generic text keywords (last resort fallback) ──────────────────────────
  // v5: Use \b word boundaries on English keywords to avoid partial matches
  { pattern: /\bdomestic\b|Category-I/i,                               category: 'Residential (LT-1)' },
  { pattern: /\bresidential\b|Tariff IA|LT-2A|LT-1|RGH/i,                 category: 'Residential (LT-1)' },
  { pattern: /घरेलू/,                                            category: 'Residential (LT-1)' },
  { pattern: /\bcommercial\b|Non-Domestic|Category-II/i,                  category: 'Commercial (LT-2)'  },
  { pattern: /व्यावसायिक|व्यापारिक/,                              category: 'Commercial (LT-2)'  },
  { pattern: /\bindustrial\b|LT-3/i,                                  category: 'Industrial (LT-3)'  },
  { pattern: /उद्योग|औद्योगिक/,                                  category: 'Industrial (LT-3)'  },
  { pattern: /\bagricultur/i,                                    category: 'Agricultural (LT-5)'},
  { pattern: /कृषि/,                                             category: 'Agricultural (LT-5)'},
];

// ── Tariff code → human-readable description ─────────────────────────────────
const TARIFF_DESCRIPTIONS = {
  RGPU:   'Residential General Purpose Urban',
  RGPR:   'Residential General Purpose Rural',
  LGPU:   'Low Tension General Purpose Urban (Commercial)',
  LGPR:   'Low Tension General Purpose Rural (Commercial)',
  AGRU:   'Agricultural Urban',
  AGRR:   'Agricultural Rural',
  LMV1:   'Low & Medium Voltage - Domestic',
  'LMV-1':'Low & Medium Voltage - Domestic',
  LMV2:   'Low & Medium Voltage - Commercial',
  'LMV-2':'Low & Medium Voltage - Commercial',
  LMV5:   'Low & Medium Voltage - Agricultural',
  'LMV-5':'Low & Medium Voltage - Agricultural',
  RGH:    'Residential General High (Maharashtra)',
  COML:   'Commercial Low Tension (Maharashtra)',
  'LT-1': 'Low Tension Residential',
  'LT-2': 'Low Tension Commercial',
  'LT-3': 'Low Tension Industrial',
  'LT-5': 'Low Tension Agricultural',
  'HT-1': 'High Tension Industrial',
};

const detectMeterCategory = (text) => {
  for (const t of TARIFF_TO_CATEGORY) {
    if (t.pattern.test(text)) return t.category;
  }
  return 'Unknown';
};

// ── v5: DISCOM-context-aware meter category fallback ─────────────────────────
// If regex-based detection returns 'Unknown', use DISCOM identity + sanctioned
// load as a smart fallback (covers OCR noise, tabular format issues).
const GUJARAT_DISCOMS = ['PGVCL', 'DGVCL', 'UGVCL', 'MGVCL'];
const UP_DISCOMS     = ['PVVNL', 'DVVNL', 'MVVNL', 'PuVVNL', 'UPPCL'];

const resolveMeterCategory = (text, meterCategory, discomId, sanctionedLoad) => {
  // If already detected, return as-is
  if (meterCategory && meterCategory !== 'Unknown') return meterCategory;

  // ── Gujarat DISCOMs: try OCR-noise-tolerant patterns ────────────────────
  if (GUJARAT_DISCOMS.includes(discomId)) {
    // OCR sometimes adds spaces inside codes: "R G P U", "RG PU"
    if (/R\s*G\s*P\s*[UR]/i.test(text)) return 'Residential (LT-1)';
    if (/L\s*G\s*P\s*[UR]/i.test(text)) return 'Commercial (LT-2)';
    if (/A\s*G\s*R\s*[UR]/i.test(text)) return 'Agricultural (LT-5)';
    // Fallback by sanctioned load (Gujarat residential ≤ 5 kW typical)
    if (sanctionedLoad && sanctionedLoad <= 5) return 'Residential (LT-1)';
    if (sanctionedLoad && sanctionedLoad <= 20) return 'Commercial (LT-2)';
  }

  // ── UP DISCOMs: try OCR-noise-tolerant patterns ─────────────────────────
  if (UP_DISCOMS.includes(discomId)) {
    // Handle LMV with any separator noise between letters and digit
    if (/L\s*M\s*V[^a-z]*1/i.test(text)) return 'Residential (LT-1)';
    if (/L\s*M\s*V[^a-z]*2/i.test(text)) return 'Commercial (LT-2)';
    if (/L\s*M\s*V[^a-z]*5/i.test(text)) return 'Agricultural (LT-5)';
    if (sanctionedLoad && sanctionedLoad <= 5) return 'Residential (LT-1)';
  }

  // ── Generic fallback: small sanctioned load = residential ───────────────
  if (sanctionedLoad) {
    if (sanctionedLoad <= 5) return 'Residential (LT-1)';
    if (sanctionedLoad <= 25) return 'Commercial (LT-2)';
    return 'Industrial (LT-3)';
  }

  return 'Unknown';
};

// ── v5: Solar eligibility from meter category ────────────────────────────────
const getSolarEligible = (meterCategory) => {
  if (!meterCategory || meterCategory === 'Unknown') return null;
  if (/residential|commercial|LT-1|LT-2|domestic/i.test(meterCategory)) return true;
  if (/industrial|agricultural|HT/i.test(meterCategory)) return false;
  return null;
};

// ── v5: Tariff description from tariff code ──────────────────────────────────
const getTariffDesc = (tariffCode) => {
  if (!tariffCode) return null;
  const normalized = tariffCode.replace(/[\s\-.]+/g, '').toUpperCase();
  // Try exact, then normalized
  return TARIFF_DESCRIPTIONS[tariffCode] || TARIFF_DESCRIPTIONS[normalized] || null;
};

// Extracts the raw tariff code string (e.g. "RGPU", "LMV-1", "LT-2") from bill text
const extractTariffCode = (text) => {
  const labeled = text.match(
    /(?:tariff|टैरिफ\s*\/?\s*tariff|meter\s*(?:type|code|category|ctg)(?:\s*code)?|rate\s*schedule|schedule|Tal:)[\s:\-]*([A-Z]{1,5}[)\s\-.|]*\d{0,2}[A-Z]?)/i
  );
  if (labeled && /RGPU|RGPR|LGPU|LGPR|AGRU|AGRR|LMV|LT|HT|HV/i.test(labeled[1])) {
    return labeled[1].trim().replace(/[).\s|]/g, '').toUpperCase();
  }
  
  if (/Lore\s*ER|Redemialf/i.test(text)) return 'LMV-1';

  const bare = text.match(/\b(RGPU|RGPR|LGPU|LGPR|AGRU|AGRR|LMV[)\s\-.|]*[1-5Il]|HV[-\s]?\d|LT[-\s]?\d|HT[-\s]?\d)\b/i);
  if (bare) return bare[1].replace(/[).\s|]/g, '').toUpperCase();
  return null;
};

const mapCategoryToTariff = (category, discomId) => {
  if (['PGVCL', 'DGVCL', 'UGVCL', 'MGVCL'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'RGPU';
    if (category === 'Commercial (LT-2)') return 'LGPU';
    if (category === 'Agricultural (LT-5)') return 'AGRU';
  }
  if (['PVVNL', 'DVVNL', 'MVVNL', 'PuVVNL', 'UPPCL'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'LMV-1';
    if (category === 'Commercial (LT-2)') return 'LMV-2';
    if (category === 'Industrial (LT-3)') return 'LMV-3';
    if (category === 'Agricultural (LT-5)') return 'LMV-5';
  }
  if (['MSEDCL'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'LT-1';
    if (category === 'Commercial (LT-2)') return 'LT-2';
  }
  if (['BESCOM'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'LT-2A';
    if (category === 'Commercial (LT-2)') return 'LT-3';
  }
  if (['TNEB'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'Tariff IA';
    if (category === 'Commercial (LT-2)') return 'Tariff IIA';
  }
  if (['BSES'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'Domestic';
    if (category === 'Commercial (LT-2)') return 'Non-Domestic';
  }
  if (['TSSPDCL', 'APSPDCL'].includes(discomId)) {
    if (category === 'Residential (LT-1)') return 'Category-I';
    if (category === 'Commercial (LT-2)') return 'Category-II';
  }
  return null;
};

const parseNum = (str) => {
  if (!str) return null;
  const n = Number(str.replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
};

// ── main parseBillText ───────────────────────────────────────────────────────
export const parseBillText = (rawText) => {
  // Normalise: collapse whitespace, keep newlines as space
  const text = rawText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

  // ── DISCOM & State ─────────────────────────────────────────────────────────
  const discom = detectDiscom(text);
  const detectedState = discom.state;
  const discomId = discom.id;

  // ── Consumer Number ────────────────────────────────────────────────────────
  // English labels + Hindi: उपभोक्ता संख्या / Consumer No. / Account No.
  // v5: Added "Account No", "C/h No", "खाता संo", 8-15 digit range
  let consumerNumber = null;
  const cnPatterns = [
    /(?:consumer\s*(?:no|number|code|#|id)|account\s*(?:no|number)|C\/h\s*No|खाता\s*(?:सं|संo|संख्या)|उपभोक्ता\s*(?:सं|संख्या|क्रमांक))[.:\s]*([0-9]{7,15})/i,
    /\b(0[0-9]{9,11})\b/,            // PGVCL/PVVNL format: starts with 0, 10-12 digits
    /\b([0-9]{10,12})\b/,            // generic 10–12 digit
  ];
  for (const p of cnPatterns) {
    const m = text.match(p);
    if (m) { consumerNumber = m[1]; break; }
  }

  // ── Consumer Name ──────────────────────────────────────────────────────────
  // English: "Name : RAMESH PATEL" or "Consumer Name: ..."
  // Hindi: "नाम : रमेश पटेल"
  // v5: Added "नाम / Name" pattern for PVVNL bills, bare "Name:" pattern
  let consumerName = null;
  const namePatterns = [
    /(?:consumer\s*name|name\s*of\s*consumer)[\s:\-2]*([A-Z][A-Za-z\s.]{2,40})(?=\s+(?:address|s\/o|w\/o|d\/o|mobile|meter|bill|consumer|tariff|\n))/i,
    // PVVNL extreme noise: "जाया Name 2 CHETAN KHANNA Wu Division"
    // Case-sensitive to ensure we only capture UPPERCASE names and stop at Title Case words (like Wu)
    /(?:नाम|Name|NAME|जाया)[\s:\-2]*(?:Name|NAME)?[\s:\-2]*\n?([A-Z][A-Z\s.]{2,40}?)\s*(?=[A-Z][a-z]|Division|Div|पिता|Husband|Address|\n)/,
    // Hindi only: "नाम :"
    /(?:नाम|उपभोक्ता\s*का\s*नाम)[\s:\-2]*(.{3,40}?)(?=\s+(?:पता|मोबाइल|मीटर|बिल|\n))/,
    // PGVCL: name appears after "Consumer No." line
    /(?:CONSUMER\s*(?:NO|CODE|NAME)[^a-z\n]{0,30}\n\s*)([A-Z][A-Z\s.]{3,40})\n/,
    // Bare "Name :" pattern with strict newline ending
    /\bName[\s:\-2]*([A-Z][A-Za-z\s.]{2,40})\n/i,
  ];
  for (const p of namePatterns) {
    const m = text.match(p);
    if (m) { consumerName = m[1].replace(/\n/g, ' ').trim(); break; }
  }

  // ── Tariff Code & Meter Category ──────────────────────────────────────────
  let meterCategory = detectMeterCategory(text);
  let tariffCode = extractTariffCode(text);

  // ── Sanctioned Load (kW) — extract BEFORE resolveMeterCategory ─────────────
  // v5: Moved up so sanctionedLoad is available for DISCOM-context fallback
  let sanctionedLoad = null;
  const loadPatterns = [
    /(?:sanctioned?\s*load|connected\s*load|contract\s*demand|max\s*dem(?:and)?|authorized?\s*load|sanction\s*load)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:k[wW]|KVA)?/i,
    /(?:स्वीकृत\s*भार|संयोजित\s*भार|भारित\s*भार)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:kw|किलोवाट|KVA)?/i,
    // bare: a number followed by KW near load label
    /(?:sanctioned?|connected|max)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*k[wW]/i,
  ];
  for (const p of loadPatterns) {
    const m = text.match(p);
    if (m) { sanctionedLoad = Number(m[1]); break; }
  }

  // ── v5: Enhanced Meter Category — DISCOM-context-aware fallback ────────────
  // If regex failed, use DISCOM + sanctioned load to resolve
  meterCategory = resolveMeterCategory(text, meterCategory, discomId, sanctionedLoad);

  // Fallback tariff code if extraction failed but category is known
  if (!tariffCode && meterCategory !== 'Unknown') {
    tariffCode = mapCategoryToTariff(meterCategory, discomId);
  }

  // ── v5: Solar eligibility & Tariff description ────────────────────────────
  const solarEligible = getSolarEligible(meterCategory);
  const tariffDesc = getTariffDesc(tariffCode);

  // ── Monthly Units ──────────────────────────────────────────────────────────
  // PGVCL: "Total Consumption 137", "Net Units 137"
  // PVVNL: "Net Billed Unit 63.00", "Meter Units 63 KWH" (OCR noise: "नेट बिल्ड यूनिट/ 63.00")
  // Hindi: "कुल खपत", "कुल उपभोग"
  let monthlyUnits = null;
  const unitPatterns = [
    /(?:total\s*consumption|net\s*consumption|total\s*units|net\s*units|units?\s*consumed|current\s*consumption|net\s*billed\s*unit)[\s:\-\/]*\n?([0-9]+(?:\.[0-9]+)?)/i,
    /(?:consumption|units?)[\s:\-\/]*\n?([0-9]{2,5})/i,
    /(?:कुल\s*(?:खपत|उपभोग|यूनिट)|खपत|नेट\s*बिल्ड\s*यूनिट)[\s:\-\/]*\n?([0-9]+(?:\.[0-9]+)?)/,
    // v5: "Meter Units" pattern (PVVNL table)
    /(?:Meter\s*Units?|मीटर\s*यूनिट)[\s:\-\/]*\n?([0-9]+(?:\.[0-9]+)?)\s*(?:KWH|kWh|Units?)?/i,
    // v5: Number followed by "KWH" (common in tables)
    /\b(\d{2,5}(?:\.\d+)?)\s*KWH\b/i,
    // PGVCL table: a standalone 3-4 digit number near "Units" heading
    /\bUnits?\b.*?\b([1-9][0-9]{1,4})\b/i,
  ];
  for (const p of unitPatterns) {
    const m = text.match(p);
    if (m) {
      const v = parseNum(m[1]);
      if (v && v > 0 && v < 99999) { monthlyUnits = v; break; }
    }
  }

  // ── Bill Amount ────────────────────────────────────────────────────────────
  // PGVCL uses "Net Bill Amount" or "Net Payable"
  // PVVNL uses "Payable Amount", "Payable by Due date", "Net Current Bill"
  // Hindi: "देय राशि", "कुल बिल राशि", "शुद्ध देय राशि", "देय धनराशि"
  let billAmount = null;
  const amtPatterns = [
    /(?:net\s*bill\s*amount|net\s*payable|net\s*amount\s*payable|amount\s*payable|total\s*bill\s*amount|total\s*amount)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:bill\s*amount|payable\s*amount)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    // v5: "Payable by Due date" (PVVNL)
    /(?:payable\s*by\s*due\s*date|payable\s*before\s*due)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    // v5: "Net Current Bill" (PVVNL)
    /(?:net\s*current\s*bill|नेट\s*करंट\s*बिल)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    // Hindi patterns
    /(?:देय\s*(?:धनराशि|राशि)|कुल\s*(?:बिल\s*)?राशि|शुद्ध\s*देय\s*राशि|भुगतान\s*योग्य)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
    // PGVCL: "Total (12 to 18)" or "Total (1 to 11)" row at bottom of bill table
    /Total\s*\(\d+\s*(?:to|-)\s*\d+\)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  ];
  for (const p of amtPatterns) {
    const m = text.match(p);
    if (m) {
      const v = parseNum(m[1]);
      if (v && v > 0) { billAmount = v; break; }
    }
  }

  // ── Due Amount (arrears / outstanding) ────────────────────────────────────
  let dueAmount = null;
  const dueAmtPatterns = [
    /(?:due\s*amount|arrears?|outstanding\s*(?:amount|dues?)|previous\s*(?:dues?|balance)|arrear\s*amount)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:बकाया\s*(?:राशि|धनराशि)?|पिछला\s*बकाया)\s*[:\-]?\s*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
  ];
  for (const p of dueAmtPatterns) {
    const m = text.match(p);
    if (m) {
      const v = parseNum(m[1]);
      if (v !== null) { dueAmount = v; break; }
    }
  }

  // ── Bill Date ──────────────────────────────────────────────────────────────
  let billDate = null;
  const billDatePatterns = [
    /(?:bill\s*date|billing\s*date|बिल\s*(?:दिनांक|तिथि)|बिल\s*की\s*तारीख)\s*[:\-]?\s*([0-9]{1,2}[-./][A-Za-z0-9]{2,3}[-./][0-9]{2,4})/i,
    /(?:bill\s*date|invoice\s*date)\s*[:\-]?\s*([0-9]{1,2}[-./][0-9]{1,2}[-./][0-9]{2,4})/i,
  ];
  for (const p of billDatePatterns) {
    const m = text.match(p);
    if (m) { billDate = parseIndianDate(m[1]); if (billDate) break; }
  }

  // ── Due Date ───────────────────────────────────────────────────────────────
  // PGVCL: "Last Date For Payment"
  // PVVNL: "Due Date" / "देय तिथि"
  let dueDate = null;
  const dueDatePatterns = [
    /(?:last\s*date\s*(?:for\s*)?(?:payment|pay)|due\s*date|payment\s*due\s*date)\s*[:\-]?\s*([0-9]{1,2}[-./][A-Za-z0-9]{2,3}[-./][0-9]{2,4})/i,
    /(?:last\s*date\s*(?:for\s*)?(?:payment|pay)|due\s*date)\s*[:\-]?\s*([0-9]{1,2}[-./][0-9]{1,2}[-./][0-9]{2,4})/i,
    /(?:देय\s*तिथि|भुगतान\s*(?:की\s*)?अंतिम\s*तिथि|अंतिम\s*तिथि)\s*[:\-]?\s*([0-9]{1,2}[-./][A-Za-z0-9]{2,4}[-./][0-9]{2,4})/,
  ];
  for (const p of dueDatePatterns) {
    const m = text.match(p);
    if (m) { dueDate = parseIndianDate(m[1]); if (dueDate) break; }
  }

  // ── Billing Period ─────────────────────────────────────────────────────────
  let billingPeriodFrom = null;
  let billingPeriodTo = null;
  const periodPatterns = [
    /(?:billing\s*period|bill\s*period|reading\s*period)\s*[:\-]?\s*([0-9]{1,2}[-./][A-Za-z0-9]{2,3}[-./][0-9]{2,4})\s*(?:to|-)\s*([0-9]{1,2}[-./][A-Za-z0-9]{2,3}[-./][0-9]{2,4})/i,
    /(?:billing\s*period|bill\s*period)\s*[:\-]?\s*([0-9]{1,2}[-./][0-9]{1,2}[-./][0-9]{2,4})\s*(?:to|-)\s*([0-9]{1,2}[-./][0-9]{1,2}[-./][0-9]{2,4})/i,
  ];
  for (const p of periodPatterns) {
    const m = text.match(p);
    if (m) {
      billingPeriodFrom = parseIndianDate(m[1]);
      billingPeriodTo = parseIndianDate(m[2]);
      if (billingPeriodFrom) break;
    }
  }

  // ── v5: District extraction ────────────────────────────────────────────────
  let district = null;
  const districtPatterns = [
    // Labeled: "District: Varanasi" or "जिला: वाराणसी"
    /(?:district|जिला|जनपद)\s*[:\-]?\s*([A-Za-z]{3,25})/i,
    // Major Indian city names (known cities list)
    /\b(VARANASI|LUCKNOW|KANPUR|ALLAHABAD|PRAYAGRAJ|AGRA|MEERUT|GHAZIABAD|NOIDA|GORAKHPUR|BAREILLY|ALIGARH|MORADABAD|MATHURA|JHANSI|AYODHYA|JAIPUR|JODHPUR|UDAIPUR|KOTA|AJMER|BIKANER|AHMEDABAD|RAJKOT|SURAT|VADODARA|JUNAGADH|BHAVNAGAR|GANDHINAGAR|ANAND|MORBI|BHARUCH|NAVSARI|VALSAD|AMRELI|PORBANDAR|MUMBAI|PUNE|NAGPUR|NASHIK|THANE|AURANGABAD|SOLAPUR|KOLHAPUR|BANGALORE|BENGALURU|MYSORE|HUBLI|MANGALORE|CHENNAI|COIMBATORE|MADURAI|SALEM|TIRUCHIRAPPALLI|HYDERABAD|SECUNDERABAD|WARANGAL|KOLKATA|HOWRAH|BHOPAL|INDORE|GWALIOR|JABALPUR|DEHRADUN|HARIDWAR|RISHIKESH|PATNA|RANCHI|JAMSHEDPUR|BHUBANESWAR|CUTTACK|GUWAHATI|SHIMLA|CHANDIGARH|AMRITSAR|LUDHIANA|JALANDHAR|PANAJI|RAIPUR|BILASPUR)\b/i,
    // City name before PIN code (6 digits)
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+\d{6}\b/,
  ];
  for (const p of districtPatterns) {
    const m = text.match(p);
    if (m) {
      const d = m[1].trim();
      if (d.length >= 3 && d.length <= 25) { district = d; break; }
    }
  }

  // ── Bill Status ────────────────────────────────────────────────────────────
  let billStatus = 'Unknown';
  if (dueAmount !== null) {
    billStatus = dueAmount > 0 ? 'Overdue' : 'Paid';
  } else if (/overdue|pending|outstanding|arrear/i.test(text) || /बकाया/.test(text)) {
    billStatus = 'Overdue';
  } else if (/paid|no\s*dues?|nil\s*dues?/i.test(text)) {
    billStatus = 'Paid';
  } else {
    billStatus = 'Due'; // current month bill — not yet overdue
  }

  // ── Months Overdue ─────────────────────────────────────────────────────────
  let monthsOverdue = 0;
  if (billStatus === 'Overdue' && dueDate) {
    const diffMs = Date.now() - dueDate.getTime();
    if (diffMs > 0) monthsOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  }

  // ── Confidence score ───────────────────────────────────────────────────────
  // v5: meterCategory (non-Unknown) also counts toward confidence
  const found = [
    consumerNumber,
    consumerName,
    monthlyUnits,
    billAmount,
    tariffCode,
    meterCategory !== 'Unknown' ? meterCategory : null,
  ].filter(Boolean).length;
  const confidence = found >= 4 ? 'high' : found >= 2 ? 'medium' : 'low';

  // ── v5: Bill format label ──────────────────────────────────────────────────
  const billFormat = discomId !== 'UNKNOWN' ? `${discomId} Format` : 'Generic';

  return {
    discomId,
    detectedState,
    billFormat,            // v5 new
    consumerNumber,
    consumerName,
    district,              // v5 new
    tariffCode,
    tariffDesc,            // v5 new
    meterCategory,
    solarEligible,         // v5 new
    monthlyUnits,
    billAmount,
    dueAmount,
    billStatus,
    billDate,
    dueDate,
    billingPeriodFrom,
    billingPeriodTo,
    sanctionedLoad,
    monthsOverdue,
    confidence,
    rawTextPreview: text.slice(0, 400),
  };
};

// ── Solar KW recommendation ───────────────────────────────────────────────────
// v5 FIX: Now accepts and uses kwRules from DB (unitsPerKW, safetyBuffer,
//         roundUpToNext, maxAutoSuggestKW). Falls back to sensible defaults.
export const deriveRecommendedKw = ({ monthlyUnits, billAmount, kwRules }) => {
  const units = monthlyUnits || (billAmount ? Math.round(billAmount / 7.2) : 0);
  if (!units) return { recommendedKw: null, monthlyUnitsUsed: null };

  // Use DB-configured rules if available, otherwise sensible defaults
  const unitsPerKW     = kwRules?.unitsPerKW       || 105;
  const safetyBuffer   = kwRules?.safetyBuffer      || 1;
  const roundStep      = kwRules?.roundUpToNext     || 0.5;
  const maxKW          = kwRules?.maxAutoSuggestKW  || 15;

  const raw     = (units / unitsPerKW) * safetyBuffer;
  const rounded = Math.ceil(raw / roundStep) * roundStep;
  const kw      = Math.max(1, Math.min(maxKW, rounded));

  return { recommendedKw: kw, monthlyUnitsUsed: units };
};

// ── Subsidy estimation ────────────────────────────────────────────────────────
// v5 FIX: Now accepts detectedState + stateOverrides and calculates
//         central (PM Surya Ghar) + state subsidy combined.
export const estimateSubsidy = (kw, meterCategory, detectedState, rules) => {
  const isResidential = /residential|LT-1|domestic/i.test(meterCategory || '');
  if (!isResidential) {
    return {
      subsidyAmount: 0,
      note: 'PM Surya Ghar central subsidy is only for Residential (LT-1) category',
    };
  }

  // ── Central subsidy (PM Surya Ghar Yojana) — capped at 3 kW ──────────────
  const subsidyCapKw = Math.min(kw, 3);
  let centralSubsidy = 78000;
  if (subsidyCapKw <= 0) centralSubsidy = 0;
  else if (subsidyCapKw <= 2) centralSubsidy = Math.round(subsidyCapKw * 30000);
  else if (subsidyCapKw < 3) centralSubsidy = Math.round(60000 + (subsidyCapKw - 2) * 18000);

  // ── State subsidy ─────────────────────────────────────────────────────────
  let stateSubsidy = 0;
  let stateScheme = null;
  if (detectedState) {
    const stateInfo = getStateSubsidyData(detectedState, rules?.stateSubsidies || []);
    if (stateInfo) {
      stateSubsidy = Math.min(
        stateInfo.stateSubsidyPerKW * subsidyCapKw,
        stateInfo.stateSubsidyMax,
      );
      stateScheme = stateInfo.stateScheme;
    }
  }

  const subsidyAmount = centralSubsidy + stateSubsidy;
  return {
    subsidyAmount,
    note: stateSubsidy > 0
      ? `PM Surya Ghar (Central: ₹${centralSubsidy}) + ${stateScheme || 'State'} (₹${stateSubsidy}) — final amount post site survey`
      : 'PM Surya Ghar Yojana estimate — final amount confirmed post site survey',
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// ── AUSTRALIA ELECTRICITY BILL PARSER ────────────────────────────────────
// Supports: AGL, Origin Energy, EnergyAustralia, Synergy, AusGrid,
//           Ergon Energy, Powercor, ActewAGL, Aurora Energy, SA Power Networks
// ═══════════════════════════════════════════════════════════════════════════

const AU_RETAILERS = [
  { id: 'AGL',             pattern: /\bAGL\b|AGL\s*Energy/i },
  { id: 'Origin Energy',   pattern: /Origin\s*Energy/i },
  { id: 'EnergyAustralia', pattern: /Energy\s*Australia/i },
  { id: 'Synergy',         pattern: /\bSynergy\b/i },
  { id: 'ActewAGL',        pattern: /ActewAGL/i },
  { id: 'Aurora Energy',   pattern: /Aurora\s*Energy/i },
  { id: 'Ergon Energy',    pattern: /Ergon\s*Energy/i },
  { id: 'Powercor',        pattern: /Powercor/i },
  { id: 'CitiPower',       pattern: /CitiPower/i },
  { id: 'Jemena',          pattern: /Jemena/i },
  { id: 'Lumo Energy',     pattern: /Lumo\s*Energy/i },
  { id: 'Red Energy',      pattern: /Red\s*Energy/i },
  { id: 'Simply Energy',   pattern: /Simply\s*Energy/i },
  { id: 'Momentum Energy', pattern: /Momentum\s*Energy/i },
  { id: 'Alinta Energy',   pattern: /Alinta\s*Energy/i },
  { id: 'Horizon Power',   pattern: /Horizon\s*Power/i },
  { id: 'SA Power Networks',pattern: /SA\s*Power\s*Networks?/i },
  { id: 'Ausgrid',         pattern: /Ausgrid/i },
  { id: 'Endeavour Energy',pattern: /Endeavour\s*Energy/i },
];

// AU State code → full state name
const AU_STATE_MAP = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA:  'Western Australia',
  SA:  'South Australia',
  TAS: 'Tasmania',
  ACT: 'Australian Capital Territory',
  NT:  'Northern Territory',
};

/**
 * parseAuBillText — parse raw OCR text from an Australian electricity bill
 * Returns structured data: retailer, accountNumber, customerName, suburb,
 * state, postcode, quarterlyKwh, quarterlyBillAmount, solarExportKwh,
 * solarExportCredit, tariffType, meterType, billingPeriod, balance
 */
export const parseAuBillText = (text) => {
  const t = text; // raw text (keep case for name extraction)
  const TU = t.toUpperCase();

  // ── 1. Retailer detection ─────────────────────────────────────────────────
  let retailer = null;
  for (const r of AU_RETAILERS) {
    if (r.pattern.test(t)) { retailer = r.id; break; }
  }

  // ── 2. Account / NMI Number ───────────────────────────────────────────────
  let accountNumber = null;
  const acctMatch = t.match(/(?:Account\s*(?:Number|No\.?|#)?|NMI|Meter\s*No\.?)[\s:]*([A-Z0-9]{6,20})/i);
  if (acctMatch) accountNumber = acctMatch[1].trim();

  // ── 3. Customer Name ──────────────────────────────────────────────────────
  let customerName = null;
  const namePatterns = [
    /(?:Customer|Account\s*Holder|Name)\s*[:\-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /Dear\s+(?:Mr\.?\s*|Ms\.?\s*|Mrs\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}),?/i,
  ];
  for (const p of namePatterns) {
    const m = t.match(p);
    if (m) { customerName = m[1].trim(); break; }
  }

  // ── 4. Address — Suburb, State, Postcode ──────────────────────────────────
  let suburb = null, state = null, postcode = null;

  // Australian postcode: 4 digits, 2000-9999
  const postcodeMatch = t.match(/\b([2-9]\d{3})\b/);
  if (postcodeMatch) postcode = postcodeMatch[1];

  // State code (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
  const stateMatch = t.match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/);
  if (stateMatch) state = AU_STATE_MAP[stateMatch[1]] || stateMatch[1];

  // Suburb: word(s) before STATE CODE or before postcode
  if (stateMatch) {
    const beforeState = t.substring(0, stateMatch.index).trim();
    const words = beforeState.split(/[\s,\n]+/).filter(Boolean);
    // Last 1-3 uppercase/titlecase words before state = suburb
    const suburbWords = [];
    for (let i = words.length - 1; i >= 0 && suburbWords.length < 3; i--) {
      if (/^[A-Z][a-zA-Z]+$/.test(words[i])) suburbWords.unshift(words[i]);
      else break;
    }
    if (suburbWords.length > 0) suburb = suburbWords.join(' ');
  }

  // ── 5. Billing Period ─────────────────────────────────────────────────────
  let billingPeriodFrom = null, billingPeriodTo = null, billingDays = null;

  // "1 January 2025 to 31 March 2025" or "01/01/2025 - 31/03/2025"
  const periodMatch = t.match(
    /(?:Bill(?:ing)?\s*Period|Period|From|service\s*period)[\s:]*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{2,4})\s*(?:to|–|-)\s*([0-9]{1,2}[\s\/\-][A-Za-z0-9]+[\s\/\-][0-9]{2,4})/i
  );
  if (periodMatch) {
    billingPeriodFrom = periodMatch[1].trim();
    billingPeriodTo   = periodMatch[2].trim();
  }
  const daysMatch = t.match(/(\d+)\s*(?:days?|day\s*period)/i);
  if (daysMatch) billingDays = parseInt(daysMatch[1], 10);

  // ── 6. kWh Usage (quarterly or whatever billing period) ───────────────────
  let quarterlyKwh = null, dailyKwh = null;

  // "Total Usage: 1,234 kWh" or "Electricity Used 987.5 kWh"
  const usagePatterns = [
    /(?:Total\s*)?(?:Electricity\s*)?(?:Usage|Used|Consumption|kWh\s*Used|Units\s*Used)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*kWh/i,
    /([\d,]+(?:\.\d+)?)\s*kWh\s*(?:used|consumed|usage)/i,
    /(?:Peak\s*\+\s*Off.?Peak|Total)\s*(?:Usage)?\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*kWh/i,
  ];
  for (const p of usagePatterns) {
    const m = t.match(p);
    if (m) {
      quarterlyKwh = parseFloat(m[1].replace(/,/g, ''));
      if (billingDays && billingDays > 0) dailyKwh = +(quarterlyKwh / billingDays).toFixed(2);
      break;
    }
  }

  // ── 7. Daily average kWh (some bills show this directly) ─────────────────
  if (!dailyKwh) {
    const dailyMatch = t.match(/(?:Daily\s*Average|Avg\.?\s*Daily\s*Usage)\s*[:\-]?\s*([\d.]+)\s*kWh/i);
    if (dailyMatch) dailyKwh = parseFloat(dailyMatch[1]);
  }

  // ── 8. Bill Amount ────────────────────────────────────────────────────────
  let quarterlyBillAmount = null;

  // "Total Amount Due: $1,234.56" or "Amount Payable $456.78"
  const amountPatterns = [
    /(?:Total\s*Amount\s*(?:Due|Payable|Outstanding)|Amount\s*(?:Due|Payable)|Balance\s*Due|Please\s*Pay)\s*[:\-]?\s*\$\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:Total\s*(?:Current\s*)?Bill|Bill\s*Total)\s*[:\-]?\s*\$\s*([\d,]+(?:\.\d{2})?)/i,
    /\$\s*([\d,]+\.\d{2})\s*(?:is\s*due|payable|due\s*by)/i,
  ];
  for (const p of amountPatterns) {
    const m = t.match(p);
    if (m) {
      quarterlyBillAmount = parseFloat(m[1].replace(/,/g, ''));
      break;
    }
  }

  // ── 9. Solar Export (Feed-in) ─────────────────────────────────────────────
  let solarExportKwh = null, solarExportCredit = null;

  const exportKwhMatch = t.match(/(?:Solar\s*Export|Feed.?in\s*(?:Credit|Tariff)?|Exported\s*(?:Energy)?)\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*kWh/i);
  if (exportKwhMatch) solarExportKwh = parseFloat(exportKwhMatch[1].replace(/,/g, ''));

  const exportCreditMatch = t.match(/(?:Solar\s*Export\s*Credit|Feed.?in\s*Credit|FiT\s*Credit)\s*[:\-]?\s*-?\s*\$\s*([\d,]+(?:\.\d{2})?)/i);
  if (exportCreditMatch) solarExportCredit = parseFloat(exportCreditMatch[1].replace(/,/g, ''));

  // ── 10. Tariff type ───────────────────────────────────────────────────────
  let tariffType = null;
  if (/Time\s*of\s*Use|TOU/i.test(t)) tariffType = 'Time of Use (TOU)';
  else if (/Single\s*Rate|Flat\s*Rate/i.test(t)) tariffType = 'Single Rate';
  else if (/Controlled\s*Load|Off.?Peak/i.test(t)) tariffType = 'Controlled Load';

  // ── 11. Meter type ────────────────────────────────────────────────────────
  let meterType = null;
  if (/Smart\s*Meter|Interval\s*Meter/i.test(t)) meterType = 'Smart Meter';
  else if (/Basic\s*Meter|Accumulation\s*Meter/i.test(t)) meterType = 'Basic Meter';

  // ── 12. Estimated monthly equivalent ─────────────────────────────────────
  // AU bills are quarterly (90 days). Monthly equivalent = quarterlyKwh / 3
  const monthlyKwhEquivalent = quarterlyKwh ? Math.round(quarterlyKwh / 3) : null;
  const monthlyBillEquivalent = quarterlyBillAmount ? Math.round(quarterlyBillAmount / 3) : null;

  // ── 13. Confidence scoring ────────────────────────────────────────────────
  let score = 0;
  if (retailer)             score += 25;
  if (quarterlyKwh)         score += 25;
  if (quarterlyBillAmount)  score += 20;
  if (postcode)             score += 10;
  if (state)                score += 10;
  if (customerName)         score += 10;
  const confidence = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  return {
    country: 'australia',
    confidence,
    retailer,
    accountNumber,
    customerName,
    suburb,
    state,
    postcode,
    billingPeriodFrom,
    billingPeriodTo,
    billingDays,
    quarterlyKwh,
    dailyKwh,
    monthlyKwhEquivalent,
    monthlyBillEquivalent,
    quarterlyBillAmount,
    solarExportKwh,
    solarExportCredit,
    tariffType,
    meterType,
  };
};

// ── AU STC Zone calculator ────────────────────────────────────────────────────
// Returns zone 1-4 based on 4-digit AU postcode (approximation)
export const getAuStcZone = (postcode) => {
  const code = parseInt(postcode, 10);
  if (!code) return 3;
  // Zone 1: NT (0800-0899) + North QLD (4700-4899) + North WA (6700-6799)
  if ((code >= 800 && code <= 899) || (code >= 4700 && code <= 4899) || (code >= 6700 && code <= 6799)) return 1;
  // Zone 2: Central QLD (4300-4699) + Central WA (6600-6699)
  if ((code >= 4300 && code <= 4699) || (code >= 6600 && code <= 6699)) return 2;
  // Zone 4: Tasmania (7000-7999) + Alpine ACT
  if ((code >= 7000 && code <= 7999) || code === 2627 || code === 2628) return 4;
  // Zone 3: default (Sydney, Melbourne, Brisbane, Adelaide, Perth metro)
  return 3;
};

// ── AU STC calculator ─────────────────────────────────────────────────────────
// zone multipliers per CEC/ORER deeming table
const AU_ZONE_MULTIPLIERS = { 1: 1.622, 2: 1.536, 3: 1.382, 4: 1.185 };

export const calcAuStcs = ({ kw, zone, deemingYears = 5, stcPrice = 38 }) => {
  const multiplier = AU_ZONE_MULTIPLIERS[zone] || 1.382;
  const stcs = Math.floor(kw * multiplier * deemingYears);
  const stcValue = Math.round(stcs * stcPrice);
  const installCost = Math.round(kw * 1100); // ~$1100/kW typical AU
  const netCost = Math.max(500, installCost - stcValue);
  return { zone, multiplier, deemingYears, stcPrice, stcs, stcValue, installCost, netCost };
};

