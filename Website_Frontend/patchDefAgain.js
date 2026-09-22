import fs from 'fs';
let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

const oldCheckEligDef = /const handleCheckEligibility = async\s*\(\{\s*meterCategory,\s*billAmount,\s*monthlyUnits,\s*dueAmount,\s*billStatus,\s*monthsOverdue,\s*billDate,\s*overrideKw\s*=\s*0\s*\}\)\s*=>\s*\{\s*setIsCheckingEligibility\(true\);\s*setEligibilityError\(""\);\s*setEligibilityResult\(null\);\s*try\s*\{\s*const\s*\{\s*data\s*\}\s*=\s*await\s*billScanApi\.post\("\/api\/light-bill\/check-eligibility",\s*\{\s*meterCategory,\s*billAmount,\s*monthlyUnits,\s*dueAmount,\s*billStatus,\s*monthsOverdue,\s*state:\s*customerState,\s*overrideKw,?\s*\},\s*\{\s*headers:\s*\{\s*"x-country":\s*getCountryCode\(\)\s*\}\s*\}\);/m;

const newCheckEligDef = `const handleCheckEligibility = async ({ meterCategory, billAmount, monthlyUnits, dueAmount, billStatus, monthsOverdue, billDate, overrideKw = 0, passedState, isCustomerVerified = false, criticalFieldsConfirmed = true }) => {
    setIsCheckingEligibility(true);
    setEligibilityError("");
    setEligibilityResult(null);

    try {
      const { data } = await billScanApi.post("/api/light-bill/check-eligibility", {
        meterCategory,
        billAmount,
        monthlyUnits,
        dueAmount,
        billStatus,
        monthsOverdue,
        state: passedState || customerState,
        overrideKw,
        isCustomerVerified,
        criticalFieldsConfirmed
      }, { headers: { "x-country": getCountryCode() } });`;

if (oldCheckEligDef.test(content)) {
    content = content.replace(oldCheckEligDef, newCheckEligDef);
    console.log("handleCheckEligibility DEFINITION patched!");
} else {
    console.log("Failed to match handleCheckEligibility DEFINITION!");
}

fs.writeFileSync('src/components/LeadForm.jsx', content);
