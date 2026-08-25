const fs = require('fs');

let c = fs.readFileSync('src/components/bde/BDELayout.jsx', 'utf8');

const oldLeadsCount = `return isTargetSource && !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested';`;
const newLeadsCount = `return isTargetSource && !l.installDateBooked && l.status !== 'Converted' && l.status !== 'Not Interested' && l.status !== 'Lost' && !l.convertedProjectId;`;

const oldProspectsCount = `return isTargetSource && l.installDateBooked && !l.tokenPaid;`;
const newProspectsCount = `return isTargetSource && l.installDateBooked && !l.tokenPaid && !l.convertedProjectId;`;

c = c.replace(oldLeadsCount, newLeadsCount);
c = c.replace(oldProspectsCount, newProspectsCount);

fs.writeFileSync('src/components/bde/BDELayout.jsx', c);
console.log("Fixed BDELayout counts!");
