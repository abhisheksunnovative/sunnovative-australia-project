import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillEligibilityController.js', 'utf8');

const oldStart = `    let matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);`;
const oldEnd = `      );
    }`;

const block = content.substring(content.indexOf(oldStart), content.indexOf(oldEnd) + oldEnd.length);

const originalLogic = `    const matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);

    if (!matchedCategory) {
      isEligible = false;
      reasons.push(\`Meter category "\${meterCategory || 'Unknown'}" admin settings me configured nahi hai ya bill se detect nahi ho paayi.\`);
    } else {
      if (!matchedCategory.eligible) {
        isEligible = false;
        reasons.push(\`\${matchedCategory.category} category solar ke liye eligible nahi hai (admin setting).\`);
      }

      if (billAmount < matchedCategory.minMonthlyBill || billAmount > matchedCategory.maxMonthlyBill) {
        isEligible = false;
        reasons.push(\`Bill amount \${currency}\${billAmount} is category ke allowed range (???\${matchedCategory.minMonthlyBill}??????\${matchedCategory.maxMonthlyBill}) se bahar hai.\`);
      }
    }`;

content = content.replace(block, originalLogic);
fs.writeFileSync('src/controllers/lightBillEligibilityController.js', content);
console.log("Backend hack reverted.");
