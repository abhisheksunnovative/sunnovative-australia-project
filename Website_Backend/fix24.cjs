const fs = require('fs');

const tePath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let file = fs.readFileSync(tePath, 'utf8');

const oldRet = `        let status = 'auto-save';
        if (confidenceScore < 40) status = 'manual-review';
        else if (confidenceScore < 80) status = 'needs-review';

        return {
            success: true,
            status,
            confidenceScore,
            templateUsed: matchedTemplate.discomName,
            extractedData
        };`;

const newRet = `        let status = 'auto-save';
        if (confidenceScore < 40) status = 'manual-review';
        else if (confidenceScore < 80) status = 'needs-review';

        console.log('\\n======================================================');
        console.log('[TemplateExtractor] ✅ SCAN COMPLETED!');
        console.log(\`[TemplateExtractor] Discom Template Used: \${matchedTemplate.discomName}\`);
        console.log(\`[TemplateExtractor] Confidence Score: \${confidenceScore}%\`);
        console.log('[TemplateExtractor] FINAL EXTRACTED DATA (JSON):');
        console.log(JSON.stringify(extractedData, null, 2));
        console.log('======================================================\\n');

        return {
            success: true,
            status,
            confidenceScore,
            templateUsed: matchedTemplate.discomName,
            extractedData
        };`;

if (file.includes(oldRet)) {
  file = file.replace(oldRet, newRet);
  fs.writeFileSync(tePath, file);
  console.log('Added summary logs to templateExtractor.js');
} else if (file.includes(oldRet.replace(/\n/g, '\r\n'))) {
  file = file.replace(oldRet.replace(/\n/g, '\r\n'), newRet.replace(/\n/g, '\r\n'));
  fs.writeFileSync(tePath, file);
  console.log('Added summary logs to templateExtractor.js (CRLF)');
}

const scanPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/lightBillScanController.js';
let scan = fs.readFileSync(scanPath, 'utf8');

const oldRecency = `        // Bill Recency Check
        const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;
        if (!effectiveDate) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill date not found — cannot verify recency';
        } else if (isBillTooOld(effectiveDate, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
        }`;

const newRecency = `        // Bill Recency Check
        const effectiveDate = merged.billIssuedDate || merged.billingPeriodTo;
        console.log(\`[SafetyGate] Checking Recency. Effective Date found: \${effectiveDate || 'NONE'}\`);
        if (!effectiveDate) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill date not found — cannot verify recency';
            console.log('[SafetyGate] ❌ FAILED: Bill date missing completely.');
        } else if (isBillTooOld(effectiveDate, countryContext)) {
            criticalFieldsConfirmed = false;
            fallbackReason = 'Bill is older than allowed limit — ask customer for a recent bill';
            console.log(\`[SafetyGate] ❌ FAILED: Bill issued on \${effectiveDate} is too old for \${countryContext} rules!\`);
        } else {
            console.log(\`[SafetyGate] ✅ PASSED: Bill date \${effectiveDate} is within valid recency limits.\`);
        }`;

if (scan.includes(oldRecency)) {
  scan = scan.replace(oldRecency, newRecency);
} else if (scan.includes(oldRecency.replace(/\n/g, '\r\n'))) {
  scan = scan.replace(oldRecency.replace(/\n/g, '\r\n'), newRecency.replace(/\n/g, '\r\n'));
}

const oldFinal = `        return res.status(200).json({
            success: true,`;

const newFinal = `        console.log('\\n======================================================');
        console.log('[LightBillScan] ✅ FINAL MERGED RESULT READY FOR FRONTEND:');
        console.log('[LightBillScan] Critical Fields Confirmed:', criticalFieldsConfirmed);
        if (fallbackReason) console.log('[LightBillScan] Fallback Reason:', fallbackReason);
        console.log(JSON.stringify({
           discomId: merged.retailer,
           consumerNumber: merged.consumerNumber,
           consumerName: merged.fullName,
           meterCategory: merged.meterCategory,
           tariffCategory: merged.tariffCategory,
           billIssuedDate: merged.billIssuedDate,
           monthlyBill: merged.monthlyBill,
           quarterlyKwh: finalKwh,
           state: merged.state
        }, null, 2));
        console.log('======================================================\\n');

        return res.status(200).json({
            success: true,`;

if (scan.includes(oldFinal)) {
  scan = scan.replace(oldFinal, newFinal);
} else if (scan.includes(oldFinal.replace(/\n/g, '\r\n'))) {
  scan = scan.replace(oldFinal.replace(/\n/g, '\r\n'), newFinal.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(scanPath, scan);
console.log('Added summary logs to lightBillScanController.js');
