const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELeadManagement.jsx', 'utf8');

const oldBlock = `      if (data.success && data.details) {
         // Now update the lead with these details!
         const updateRes = await fetch(\`\${API_BASE}/api/bde/leads/\${billUploadLead._id}/details\`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
            body: JSON.stringify({
               billAmount: data.details.billAmount,
               nmi: data.details.nmi || data.details.consumerNumber,
               consumerNumber: data.details.consumerNumber,
               retailer: data.details.retailer || data.details.discom,
               discom: data.details.discom,
               kw: data.details.kwRecommendation,
               solarType: data.details.projectTypeRecommendation
            })
         });`;

const newBlock = `      if (data.success && (data.details || data.extracted)) {
         const details = data.details || data.extracted;
         // Now update the lead with these details!
         const updateRes = await fetch(\`\${API_BASE}/api/bde/leads/\${billUploadLead._id}/details\`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-country": isAU ? "australia" : "india" },
            body: JSON.stringify({
               billAmount: details.billAmount,
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.discom,
               kw: details.kwRecommendation || data.recommendedKw,
               solarType: details.projectTypeRecommendation || 'residential'
            })
         });`;

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/bde/BDELeadManagement.jsx', c);
  console.log("Patched scan logic!");
} else {
  console.log("Could not find the target block to patch");
}
