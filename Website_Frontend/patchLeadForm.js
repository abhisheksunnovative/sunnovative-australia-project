import fs from 'fs';

let content = fs.readFileSync('src/components/LeadForm.jsx', 'utf8');

// 1. Do not disable "Get Solar Installed" on isEligible === false
const disabledButtonRegex = /<button type="submit" disabled=\{isSubmitting \|\| \(eligibilityResult && eligibilityResult\.isEligible === false\)\}/g;
content = content.replace(disabledButtonRegex, '<button type="submit" disabled={isSubmitting}');

const disabledClassRegex = /\(eligibilityResult && eligibilityResult\.isEligible === false\)\s*\?\s*"bg-slate-400 cursor-not-allowed shadow-none"\s*:\s*"bg-solar-green hover:bg-emerald-600 shadow-emerald-500\/10 cursor-pointer"/g;
content = content.replace(disabledClassRegex, '"bg-solar-green hover:bg-emerald-600 shadow-emerald-500/10 cursor-pointer"');

// 2. Reset eligibility result when critical fields change
const meterCategoryRegex = /meterCategory: \[meterCategory, setMeterCategory\],/;
content = content.replace(meterCategoryRegex, 'meterCategory: [meterCategory, (v) => { setMeterCategory(v); setEligibilityResult(null); }],');

const tariffDescRegex = /tariffDesc: \[tariffDesc, setTariffDesc\],/;
content = content.replace(tariffDescRegex, 'tariffDesc: [tariffDesc, (v) => { setTariffDesc(v); setEligibilityResult(null); }],');

const monthlyBillRegex = /monthlyBill: \[monthlyBill, \(v\) => setMonthlyBill\(Number\(v\)\)\],/;
content = content.replace(monthlyBillRegex, 'monthlyBill: [monthlyBill, (v) => { setMonthlyBill(Number(v)); setEligibilityResult(null); }],');

fs.writeFileSync('src/components/LeadForm.jsx', content);
console.log("Patched LeadForm.jsx to fix Safety Gate button block");
