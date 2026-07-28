/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const mockConsumers = {
  "04602123456": {
    consumerNumber: "04602123456",
    consumerName: "Rajeshbhai Kanjibhai Patel",
    address: "B-204, Shivalik Pride, Near Kalawad Road, Rajkot - 360005",
    discom: "PGVCL (Paschim Gujarat Vij Company Ltd)",
    monthlyUnits: 280,
    monthlyBillAmount: 2150,
    eligibleCapacityKw: 3,
    estimatedCost: 155000,
    subsidyAmount: 78000,
    netCost: 77000,
    savedCarbonKg: 144, // kg CO2 saved per month
  },
  "2000": { // Australian Postcode Test
    consumerNumber: "2000",
    consumerName: "John Smith",
    address: "123 George St, Sydney NSW 2000",
    discom: "Ausgrid",
    monthlyUnits: 450, // per quarter
    monthlyBillAmount: 500, // $500 per quarter
    eligibleCapacityKw: 6.6,
    estimatedCost: 6600,
    subsidyAmount: 2200, // STC Discount
    netCost: 4400,
    savedCarbonKg: 300,
  },
  "04608987654": {
    consumerNumber: "04608987654",
    consumerName: "Sureshbhai Mansukhbhai Vekaria",
    address: "15, Gokuldham Society, Near Mavdi Bypass Road, Rajkot - 360004",
    discom: "PGVCL (Paschim Gujarat Vij Company Ltd)",
    monthlyUnits: 190,
    monthlyBillAmount: 1400,
    eligibleCapacityKw: 2,
    estimatedCost: 115000,
    subsidyAmount: 66000,
    netCost: 49000,
    savedCarbonKg: 96,
  },
  "04612554433": {
    consumerNumber: "04612554433",
    consumerName: "Parulben Himanshu Trivedi",
    address: "A-501, Royal Heights, University Road, Rajkot - 360005",
    discom: "PGVCL (Paschim Gujarat Vij Company Ltd)",
    monthlyUnits: 450,
    monthlyBillAmount: 3800,
    eligibleCapacityKw: 5,
    estimatedCost: 235000,
    subsidyAmount: 78000, // Maximum cap is 78000
    netCost: 157000,
    savedCarbonKg: 240,
  },
  "04604887766": {
    consumerNumber: "04604887766",
    consumerName: "Kishorbhai Laljibhai Marvaniya",
    address: "Plot 112, GIDC Phase-II, Near Morbi Road, Rajkot - 360003",
    discom: "PGVCL (Paschim Gujarat Vij Company Ltd)",
    monthlyUnits: 880,
    monthlyBillAmount: 7600,
    eligibleCapacityKw: 10,
    estimatedCost: 450000,
    subsidyAmount: 78000,
    netCost: 372000,
    savedCarbonKg: 468,
  },
};

/**
 * Returns a default mock calculation based on any bill amount in case the input
 * consumer number is not found, to keep the flow perfectly interactive!
 */
export function generateDynamicEligibility(num, bill) {
  // Try to estimate KW capacity from bill amount (approx ₹7.5 to ₹8 per unit in residential slab for PGVCL)
  const estimatedUnits = Math.round(bill / 7.5);
  // Rule of thumb: 1kW solar produces approx 120 units/month.
  // We recommend solar that covers ~100% of their use
  let recommendedKw = Math.ceil(estimatedUnits / 120);
  if (recommendedKw < 1) recommendedKw = 1;
  if (recommendedKw > 15) recommendedKw = 15; // limit residential estimation

  // Calculate PM Surya Ghar Yojana Subsidy
  // 1 kW: ₹33,000, 2 kW: ₹66,000, >=3 kW: ₹78,000 capped
  let subsidy = 0;
  if (recommendedKw === 1) {
    subsidy = 33000;
  } else if (recommendedKw === 2) {
    subsidy = 66000;
  } else {
    subsidy = 78000;
  }

  // Cost estimates: ~₹60k first kW, ~₹55k second kW, ~₹40k subsequent
  let cost = 0;
  if (recommendedKw === 1) cost = 60000;
  else if (recommendedKw === 2) cost = 115000;
  else cost = 115000 + (recommendedKw - 2) * 40000;

  const net = Math.max(10000, cost - subsidy);
  const carbon = Math.round(recommendedKw * 48);

  // Parse consumer number to make a convincing owner name/address
  const lastFour = num.length >= 4 ? num.substring(num.length - 4) : "8812";
  const firstDigit = num.charAt(0) || "0";

  return {
    consumerNumber: num || `04603${lastFour}321`,
    consumerName: `Patel House Owner (Acc: #${lastFour})`,
    address: `${firstDigit}${lastFour}/A, Shanti Niketan Society, Nana Mava Rd, Rajkot - 360005`,
    discom: "PGVCL (Paschim Gujarat Vij Company Ltd)",
    monthlyUnits: estimatedUnits || 200,
    monthlyBillAmount: bill || 1500,
    eligibleCapacityKw: recommendedKw,
    estimatedCost: cost,
    subsidyAmount: subsidy,
    netCost: net,
    savedCarbonKg: carbon,
  };
}
