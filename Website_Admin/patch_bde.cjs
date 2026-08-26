const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

// 1. Show EPC Assigned in Lead Card
const epcAssignedCode = `
                  {lead.epcDetails ? (
                    <div className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 mt-1 inline-flex w-fit">
                      ✓ EPC Assigned: {lead.epcDetails.companyName}
                    </div>
                  ) : lead.assignedEPCName ? (
                    <div className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 mt-1 inline-flex w-fit">
                      ✓ EPC Assigned: {lead.assignedEPCName}
                    </div>
                  ) : lead.status === 'Converted' ? (
                    <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-flex w-fit">
                      ⏳ Pending EPC Assignment
                    </div>
                  ) : null}
`;

// Insert it under the "Retailer/DNSP" block or maybe inside the System Info column.
// Let's insert it inside the System Info column (Col 2), after the bg-slate-50 div.
if (!c.includes('✓ EPC Assigned:')) {
  c = c.replace(
    /<\/div>\s*<\/div>\s*\{\/\* Col 4: Actions \*\/\}/g,
    '</div>\n' + epcAssignedCode + '\n              </div>\n\n              {/* Col 4: Actions */}'
  );
}

// 2. Fix handleUploadBill to save the bill to the server and update billUrl
const originalHandleUpload = `const res = await fetch(\`\${API_BASE}/api/light-bill/scan\`, {
        method: "POST",
        headers: { "x-country": isAU ? "australia" : "india" },
        body: formDataUpload
      });
      const data = await res.json();`;

const replacementHandleUpload = `const res = await fetch(\`\${API_BASE}/api/light-bill/scan\`, {
        method: "POST",
        headers: { "x-country": isAU ? "australia" : "india" },
        body: formDataUpload
      });
      const data = await res.json();

      let savedBillUrl = null;
      try {
        const uploadRes = await fetch(\`\${API_BASE}/api/upload-file\`, {
          method: "POST",
          body: formDataUpload
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          savedBillUrl = uploadData.fileUrl;
        }
      } catch(e) {
        console.warn("Could not upload actual file, only scanned:", e);
      }`;

const originalUpdate = `body: JSON.stringify({
               billAmount: details.billAmount,
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.discom,
               kw: details.kwRecommendation || data.recommendedKw,
               solarType: details.projectTypeRecommendation || 'residential'
            })`;

const replacementUpdate = `body: JSON.stringify({
               billAmount: details.billAmount,
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.discom,
               kw: details.kwRecommendation || data.recommendedKw,
               solarType: details.projectTypeRecommendation || 'residential',
               billUrl: savedBillUrl
            })`;

if (!c.includes('savedBillUrl = uploadData.fileUrl')) {
  c = c.replace(originalHandleUpload, replacementHandleUpload);
  c = c.replace(originalUpdate, replacementUpdate);
}

fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
console.log("Patched BDELeadManagement.jsx");
