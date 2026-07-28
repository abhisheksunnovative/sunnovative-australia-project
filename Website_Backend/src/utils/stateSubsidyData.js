/**
 * utils/stateSubsidyData.js
 * ─────────────────────────────────────────────────────────────────────────
 * SAME data jo CustomerEligibilityScreen.jsx (admin panel) me hardcoded tha.
 * v5 UPDATE: Ab ye fully DB-driven hai (`EligibilitySettings`). 
 * Yahan jo data hai wo sirf ek **fallback** hai in case DB me setup na ho.
 * Admin portal ke saare changes ab seedha DB se yahan aayenge!
 */

export const STATE_SUBSIDY_DATA = [
  { state: "Gujarat", stateSubsidyPerKW: 13333, stateSubsidyMax: 40000, stateScheme: "SURYA Gujarat (Surya Urja Rooftop Yojana)", agency: "MGVCL / DGVCL / UGVCL" },
  { state: "Maharashtra", stateSubsidyPerKW: 8333, stateSubsidyMax: 25000, stateScheme: "MEDA Rooftop Solar Scheme", agency: "MSEDCL / MEDA" },
  { state: "Rajasthan", stateSubsidyPerKW: 6000, stateSubsidyMax: 18000, stateScheme: "RRECL State Solar Scheme", agency: "RRECL" },
  { state: "Uttar Pradesh", stateSubsidyPerKW: 6666, stateSubsidyMax: 20000, stateScheme: "UPNEDA Residential Rooftop", agency: "UPNEDA" },
  { state: "Kerala", stateSubsidyPerKW: 8333, stateSubsidyMax: 25000, stateScheme: "KSEB Solar Rooftop", agency: "KSEB" },
  { state: "Karnataka", stateSubsidyPerKW: 5000, stateSubsidyMax: 15000, stateScheme: "KREDL State Scheme", agency: "BESCOM / KREDL" },
  { state: "Tamil Nadu", stateSubsidyPerKW: 5000, stateSubsidyMax: 15000, stateScheme: "TANGEDCO Net Metering", agency: "TANGEDCO" },
  { state: "Madhya Pradesh", stateSubsidyPerKW: 4000, stateSubsidyMax: 12000, stateScheme: "MPUVNL Rooftop Scheme", agency: "MPUVNL" },
  { state: "Delhi", stateSubsidyPerKW: 2000, stateSubsidyMax: 6000, stateScheme: "Delhi Solar Policy 2025", agency: "BSES / TPDDL" },
  { state: "Haryana", stateSubsidyPerKW: 3000, stateSubsidyMax: 9000, stateScheme: "HAREDA Rooftop Scheme", agency: "HAREDA" },
  { state: "Punjab", stateSubsidyPerKW: 3000, stateSubsidyMax: 9000, stateScheme: "PSPCL Solar Scheme", agency: "PSPCL" },
  { state: "Uttarakhand", stateSubsidyPerKW: 5000, stateSubsidyMax: 15000, stateScheme: "UREDA Solar Scheme", agency: "UREDA" },
  { state: "Andhra Pradesh", stateSubsidyPerKW: 3333, stateSubsidyMax: 10000, stateScheme: "APEPDCL Rooftop Solar", agency: "APEPDCL" },
  { state: "Telangana", stateSubsidyPerKW: 3000, stateSubsidyMax: 9000, stateScheme: "TSSPDCL Rooftop Solar", agency: "TSSPDCL" },
  { state: "Bihar", stateSubsidyPerKW: 0, stateSubsidyMax: 0, stateScheme: "Central Only", agency: "NBPDCL / SBPDCL" },
  { state: "West Bengal", stateSubsidyPerKW: 0, stateSubsidyMax: 0, stateScheme: "Central Only", agency: "WBSEDCL" },
  { state: "Odisha", stateSubsidyPerKW: 2000, stateSubsidyMax: 6000, stateScheme: "OERC Net Metering", agency: "OERC" },
  { state: "Jharkhand", stateSubsidyPerKW: 0, stateSubsidyMax: 0, stateScheme: "Central Only", agency: "JBVNL" },
  { state: "Assam", stateSubsidyPerKW: 3000, stateSubsidyMax: 9000, stateScheme: "APDCL Solar Scheme", agency: "APDCL" },
  { state: "Himachal Pradesh", stateSubsidyPerKW: 4000, stateSubsidyMax: 12000, stateScheme: "HIMURJA Solar Scheme", agency: "HIMURJA" },
  { state: "Goa", stateSubsidyPerKW: 5000, stateSubsidyMax: 15000, stateScheme: "GEDCOL Solar Scheme", agency: "GEDCOL" },
  { state: "Chhattisgarh", stateSubsidyPerKW: 2000, stateSubsidyMax: 6000, stateScheme: "CREDA Rooftop Solar", agency: "CREDA" },
];

// ── v5: Now accepts fully dynamic stateSubsidies array from DB ────────────
export const getStateSubsidyData = (state, dbStateSubsidies = []) => {
  // If DB has the state configured, use it (100% dynamic)
  if (dbStateSubsidies && dbStateSubsidies.length > 0) {
    const dbMatch = dbStateSubsidies.find(s => s.state.toLowerCase() === state.toLowerCase());
    if (dbMatch) return dbMatch;
  }

  // Fallback to hardcoded if DB is not configured yet
  return STATE_SUBSIDY_DATA.find((s) => s.state.toLowerCase() === state.toLowerCase()) || null;
};

// ── v5: Now accepts dynamic central subsidy tiers from DB ────────────
export const calcCentralSubsidy = (kw, dbCentralTiers = []) => {
  if (kw <= 0) return 0;
  
  // Use DB driven tiers if available
  if (dbCentralTiers && dbCentralTiers.length > 0) {
    // Sort tiers by maxKW ascending
    const sortedTiers = [...dbCentralTiers].sort((a, b) => a.maxKW - b.maxKW);
    for (const tier of sortedTiers) {
      if (kw <= tier.maxKW) {
        // e.g. for <3kW it might be 60000 + (kw-2)*18000
        // We'd need to adapt this or just trust the simple math if tier structure allows
        // Since PM Surya Ghar logic is tricky (sliding scale), we handle standard cases here.
        if (tier.ratePerKW > 0) {
          // If previous tier max was 2, and current is 3, base is 60k, rate is 18k
          const previousMax = sortedTiers.find(t => t.maxKW < tier.maxKW)?.maxKW || 0;
          return Math.round(tier.fixedBaseAmount + (kw - previousMax) * tier.ratePerKW);
        }
        return tier.fixedBaseAmount; // Fixed cap (e.g. 78000 for >=3)
      }
    }
    // If it exceeds all tiers, return the max fixed amount of the last tier
    return sortedTiers[sortedTiers.length - 1].fixedBaseAmount;
  }

  // Hardcoded PM Surya Ghar Fallback (India)
  if (kw <= 2) return Math.round(kw * 30000);
  if (kw < 3) return Math.round(60000 + (kw - 2) * 18000);
  return 78000; // capped at 3kW
};