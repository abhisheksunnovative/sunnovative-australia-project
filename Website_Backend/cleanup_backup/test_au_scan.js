/**
 * ┌──────────────────────────────────────────────────────────┐
 * │  AU Bill Scan API — Automated Test Script                │
 * │  Tests all 6 dummy bills against /api/light-bill/scan    │
 * │  Run: node test_au_scan.js                               │
 * └──────────────────────────────────────────────────────────┘
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:4005';
const BILLS_DIR = path.join(__dirname, 'test_bills');

// All test bills with expected extraction values
const TEST_CASES = [
  {
    file: 'au_agl_sydney.txt',
    expected: {
      retailer: 'AGL',
      suburb: 'PARRAMATTA',
      state: 'NSW',
      postcode: '2150',
      zone: 3,
      quarterlyKwh: 1324,
      billAmountApprox: 548,
    },
  },
  {
    file: 'au_origin_melbourne.txt',
    expected: {
      retailer: 'Origin',
      suburb: 'SOUTH YARRA',
      state: 'VIC',
      postcode: '3141',
      zone: 3,
      quarterlyKwh: 1832,
      billAmountApprox: 652,
    },
  },
  {
    file: 'au_energyaustralia_brisbane.txt',
    expected: {
      retailer: 'EnergyAustralia',
      suburb: 'BRISBANE CITY',
      state: 'QLD',
      postcode: '4000',
      zone: 3,
      quarterlyKwh: 1255,
      billAmountApprox: 498,
    },
  },
  {
    file: 'au_synergy_perth.txt',
    expected: {
      retailer: 'Synergy',
      suburb: 'PERTH',
      state: 'WA',
      postcode: '6000',
      zone: 3,
      quarterlyKwh: 1456,
      billAmountApprox: 586,
    },
  },
  {
    file: 'au_ergon_cairns.txt',
    expected: {
      retailer: 'Ergon',
      suburb: 'CAIRNS',
      state: 'QLD',
      postcode: '4870',
      zone: 1,
      quarterlyKwh: 1890,
      billAmountApprox: 704,
    },
  },
  {
    file: 'au_aurora_hobart.txt',
    expected: {
      retailer: 'Aurora',
      suburb: 'HOBART',
      state: 'TAS',
      postcode: '7000',
      zone: 4,
      quarterlyKwh: 2134,
      billAmountApprox: 713,
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const PASS = '\x1b[32m✓ PASS\x1b[0m';
const FAIL = '\x1b[31m✗ FAIL\x1b[0m';
const WARN = '\x1b[33m⚠ WARN\x1b[0m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function checkField(label, actual, expected, approx = false) {
  if (approx) {
    const diff = Math.abs((actual || 0) - expected);
    const pct = expected > 0 ? (diff / expected) * 100 : 0;
    if (pct <= 15) {
      console.log(`    ${PASS} ${label}: ${actual} (expected ~${expected}, diff ${pct.toFixed(1)}%)`);
      return true;
    } else {
      console.log(`    ${FAIL} ${label}: ${actual} (expected ~${expected}, diff ${pct.toFixed(1)}%)`);
      return false;
    }
  } else {
    const actualNorm = String(actual || '').toUpperCase().trim();
    const expectedNorm = String(expected).toUpperCase().trim();
    if (actualNorm.includes(expectedNorm) || expectedNorm.includes(actualNorm)) {
      console.log(`    ${PASS} ${label}: "${actual}" (expected "${expected}")`);
      return true;
    } else {
      console.log(`    ${FAIL} ${label}: "${actual}" (expected "${expected}")`);
      return false;
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log(`\n${BOLD}════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}   🇦🇺 Australia Bill Scan — Automated Tests${RESET}`);
  console.log(`${BOLD}   API: ${API_URL}/api/light-bill/scan${RESET}`);
  console.log(`${BOLD}════════════════════════════════════════════════════════════${RESET}\n`);

  let totalPass = 0;
  let totalFail = 0;
  let totalTests = 0;

  for (const tc of TEST_CASES) {
    const filePath = path.join(BILLS_DIR, tc.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ${FAIL} File not found: ${tc.file}`);
      totalFail++;
      continue;
    }

    console.log(`\n${BOLD}── ${tc.file} ──${RESET}`);
    console.log(`   Expected: ${tc.expected.retailer} | ${tc.expected.suburb}, ${tc.expected.state} ${tc.expected.postcode} | Zone ${tc.expected.zone}`);

    try {
      // Build FormData with the text file as a simulated bill
      const fileBuffer = fs.readFileSync(filePath);
      const formData = new FormData();
      formData.append('billFile', new Blob([fileBuffer], { type: 'text/plain' }), tc.file);

      const res = await fetch(`${API_URL}/api/light-bill/scan`, {
        method: 'POST',
        headers: { 'x-country': 'australia' },
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.log(`  ${FAIL} HTTP ${res.status}: ${errBody.substring(0, 200)}`);
        totalFail++;
        totalTests++;
        continue;
      }

      const data = await res.json();
      console.log(`   Confidence: ${data.confidence} | Country: ${data.country}`);

      const ex = data.extracted || {};
      const stc = data.stcInfo || {};

      let pass = 0;
      let fail = 0;

      // Check extracted fields
      checkField('Retailer', ex.retailer, tc.expected.retailer) ? pass++ : fail++;
      checkField('Suburb', ex.suburb, tc.expected.suburb) ? pass++ : fail++;
      checkField('State', ex.state, tc.expected.state) ? pass++ : fail++;
      checkField('Postcode', ex.postcode, tc.expected.postcode) ? pass++ : fail++;
      checkField('Quarterly kWh', ex.quarterlyKwh, tc.expected.quarterlyKwh, true) ? pass++ : fail++;
      checkField('Bill Amount', ex.billAmount || ex.monthlyBillEquivalent * 3, tc.expected.billAmountApprox, true) ? pass++ : fail++;

      // Check STC info
      if (data.stcInfo) {
        checkField('STC Zone', stc.zone, tc.expected.zone) ? pass++ : fail++;
        if (stc.stcs > 0) {
          console.log(`    ${PASS} STCs: ${stc.stcs} certificates`);
          pass++;
        } else {
          console.log(`    ${FAIL} STCs: ${stc.stcs} (expected > 0)`);
          fail++;
        }
        if (stc.stcValue > 0) {
          console.log(`    ${PASS} STC Value: $${stc.stcValue}`);
          pass++;
        }
        if (stc.netCost > 0) {
          console.log(`    ${PASS} Net Cost: $${stc.netCost}`);
          pass++;
        }
      } else {
        console.log(`    ${WARN} No stcInfo in response — STC calculation may not be running`);
      }

      // Recommended kW
      if (data.recommendedKw) {
        console.log(`    ${PASS} Recommended: ${data.recommendedKw} kW`);
        pass++;
      }

      totalPass += pass;
      totalFail += fail;
      totalTests += pass + fail;

      console.log(`   ${BOLD}Result: ${pass} passed, ${fail} failed${RESET}`);

    } catch (err) {
      console.log(`  ${FAIL} Error: ${err.message}`);
      totalFail++;
      totalTests++;
    }
  }

  // ── Summary ──
  console.log(`\n${BOLD}════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}   SUMMARY: ${totalPass} passed / ${totalFail} failed / ${totalTests} total${RESET}`);
  if (totalFail === 0) {
    console.log(`   ${PASS} All tests passed! 🎉`);
  } else {
    console.log(`   ${FAIL} ${totalFail} checks failed — review above`);
  }
  console.log(`${BOLD}════════════════════════════════════════════════════════════${RESET}\n`);
}

runTests().catch(console.error);
