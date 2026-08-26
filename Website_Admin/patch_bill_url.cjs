const fs = require('fs');
const file = 'src/components/bde/BDELeadManagement.jsx';
let code = fs.readFileSync(file, 'utf8');

const oldUpdate = `body: JSON.stringify({
               billAmount: details.billAmount,
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.discom,
               kw: details.kwRecommendation || data.recommendedKw,
               solarType: details.projectTypeRecommendation || 'residential'
            })`;

const newUpdate = `body: JSON.stringify({
               billAmount: details.billAmount,
               nmi: details.nmi || details.consumerNumber || details.accountNumber,
               consumerNumber: details.consumerNumber || details.accountNumber,
               retailer: details.retailer || details.discom,
               discom: details.discom,
               kw: details.kwRecommendation || data.recommendedKw,
               solarType: details.projectTypeRecommendation || 'residential',
               billUrl: data.fileUrl || undefined
            })`;

code = code.replace(oldUpdate, newUpdate);
fs.writeFileSync(file, code);
console.log("Patched BDELeadManagement with billUrl!");
