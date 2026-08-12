export const ZONE_RATINGS = {
  1: 1.536,
  2: 1.382,
  3: 1.185,
  4: 1.008
};

export const DEEMING_PERIODS = {
  2026: 10,
  2027: 9,
  2028: 8,
  2029: 7,
  2030: 6,
  2031: 5
};

export const DEFAULT_STC_PRICE = 39;

/**
 * Calculates STC (Small-scale Technology Certificates) for Australian solar projects.
 * Formula: STC Count = System kW * Zone Rating * Deeming Period (rounded down to nearest whole number)
 * 
 * @param {number} systemSizeKw - System size in kilowatts
 * @param {number} zone - STC Zone (1, 2, 3, or 4)
 * @param {number} installYear - The year of installation (e.g. 2026)
 * @param {number} stcPrice - (Optional) Current market price per STC. Defaults to 39.
 * @returns {object} Object containing stcCount, totalRebate, and breakdown.
 */
export function calculateSTC(systemSizeKw, zone, installYear = new Date().getFullYear(), stcPrice = DEFAULT_STC_PRICE) {
  if (!systemSizeKw || systemSizeKw <= 0) {
    throw new Error('System size must be greater than 0 kW');
  }
  
  if (!ZONE_RATINGS[zone]) {
    throw new Error('Invalid STC Zone. Must be 1, 2, 3, or 4.');
  }
  
  // Cap year to available periods or use 1 if outside window (SRES ends 2030, but standard calculation rules apply)
  let period = DEEMING_PERIODS[installYear];
  if (period === undefined) {
    if (installYear < 2026) period = 10;
    else if (installYear > 2030) period = 0; // Scheme ends
  }

  const rating = ZONE_RATINGS[zone];
  const stcCount = Math.floor(systemSizeKw * rating * period);
  const totalRebate = stcCount * stcPrice;

  return {
    stcCount,
    totalRebate,
    breakdown: {
      systemSizeKw,
      zone,
      zoneRating: rating,
      deemingPeriod: period,
      stcPrice
    }
  };
}
