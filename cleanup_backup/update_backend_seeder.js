const fs = require('fs');
const path = 'Website_Backend/src/controllers/lightBillEligibilityController.js';
let text = fs.readFileSync(path, 'utf8');

// 1. Fix auto-seeder
const oldSeeder = `    let settings = await EligibilitySettings.findOne({ country: countryStr });
    if (!settings) {
      // Auto-seed defaults on first deployment
      settings = await EligibilitySettings.create({
        country: countryStr,
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
            safetyBuffer: 1.2,
            maxAutoSuggestKW: 10,
          },
          dueAmountGuardrails: {
            maxAllowedDueAmount: 5000,
            dueWarningThreshold: 2000,
          }
        },
        centralSubsidyTiers: [
          { minKW: 1, maxKW: 1.99, subsidyPerKW: 30000, maxTierSubsidy: 30000 },
          { minKW: 2, maxKW: 2.99, subsidyPerKW: 30000, maxTierSubsidy: 60000 },
          { minKW: 3, maxKW: 999,  subsidyPerKW: 18000, maxTierSubsidy: 78000 },
        ],
        stateSubsidies: [
          { state: 'Uttar Pradesh', subsidyPerKW: 15000, maxSubsidyAmount: 30000 },
          { state: 'Delhi',         subsidyPerKW: 2000,  maxSubsidyAmount: 10000 },
          { state: 'Gujarat',       subsidyPerKW: 10000, maxSubsidyAmount: 20000 },
        ],
      });
    }`;

const newSeeder = `    let settings = await EligibilitySettings.findOne({ country: countryStr });
    if (!settings) {
      if (countryStr === 'australia' || countryStr === 'au') {
        settings = await EligibilitySettings.create({
          country: countryStr,
          projectCategories: [
            { id: 'residential', name: 'Residential Solar', enabled: true, minKW: 3, maxKW: 20, subsidyEligible: true, maxSubsidyAmount: 10000, description: 'Single family homes' },
            { id: 'commercial',  name: 'Commercial Solar',  enabled: true, minKW: 15, maxKW: 100, subsidyEligible: true, maxSubsidyAmount: 50000, description: 'Business premises' },
          ],
          inverterTypes: [
            { id: 'string', name: 'String Inverter', enabled: true, efficiency: 97, description: 'Most common, cost-effective' },
          ],
          eligibilityRules: {
            billToKwRanges: [
              { id: 'r1', minBill: 0,    maxBill: 300,   suggestedKW: 3, label: 'Very Low' },
              { id: 'r2', minBill: 301,  maxBill: 450,  suggestedKW: 5,   label: 'Low' },
              { id: 'r3', minBill: 451, maxBill: 600,  suggestedKW: 6.6, label: 'Medium' },
              { id: 'r4', minBill: 601, maxBill: 800,  suggestedKW: 8.8,   label: 'Medium-High' },
              { id: 'r5', minBill: 801, maxBill: 1000,  suggestedKW: 10,   label: 'High' },
              { id: 'r6', minBill: 1001, maxBill: 1300,  suggestedKW: 13,   label: 'Very High' },
              { id: 'r7', minBill: 1301, maxBill: 1600,  suggestedKW: 15,   label: 'Ultra High' },
              { id: 'r8', minBill: 1601, maxBill: 99999, suggestedKW: 20,  label: 'Maximum' },
            ],
            meterCategories: [
              { category: 'Single Rate', eligible: true,  minMonthlyBill: 0,  maxMonthlyBill: 50000  },
              { category: 'Time of Use',        eligible: true,  minMonthlyBill: 0,  maxMonthlyBill: 50000  },
              { category: 'Controlled Load',  eligible: true,  minMonthlyBill: 0, maxMonthlyBill: 50000  },
              { category: 'Residential',        eligible: true,  minMonthlyBill: 0,  maxMonthlyBill: 50000  },
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
              pmSuryaGharEligibleCategories: [],
              maxSubsidyKW: 20,
            },
            kwDerivationRules: {
              unitsPerKW: 115,
              safetyBuffer: 1.1,
              maxAutoSuggestKW: 20,
            },
            dueAmountGuardrails: {
              maxAllowedDueAmount: 5000,
              dueWarningThreshold: 2000,
            }
          },
          centralSubsidyTiers: [],
          stateSubsidies: [],
        });
      } else {
        // Indian Default Fallback
        settings = await EligibilitySettings.create({
          country: countryStr,
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
              safetyBuffer: 1.2,
              maxAutoSuggestKW: 10,
            },
            dueAmountGuardrails: {
              maxAllowedDueAmount: 5000,
              dueWarningThreshold: 2000,
            }
          },
          centralSubsidyTiers: [
            { minKW: 1, maxKW: 1.99, subsidyPerKW: 30000, maxTierSubsidy: 30000 },
            { minKW: 2, maxKW: 2.99, subsidyPerKW: 30000, maxTierSubsidy: 60000 },
            { minKW: 3, maxKW: 999,  subsidyPerKW: 18000, maxTierSubsidy: 78000 },
          ],
          stateSubsidies: [
            { state: 'Uttar Pradesh', subsidyPerKW: 15000, maxSubsidyAmount: 30000 },
            { state: 'Delhi',         subsidyPerKW: 2000,  maxSubsidyAmount: 10000 },
            { state: 'Gujarat',       subsidyPerKW: 10000, maxSubsidyAmount: 20000 },
          ],
        });
      }
    }`;

text = text.replace(oldSeeder, newSeeder);
fs.writeFileSync(path, text);
console.log("Seeder updated");
