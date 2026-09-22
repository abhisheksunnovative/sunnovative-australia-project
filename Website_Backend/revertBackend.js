import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillEligibilityController.js', 'utf8');

const regex = /let matchedCategory = matchMeterCategory\(meterCategory, rules\.meterCategories \|\| \[\]\);[\s\S]*?se bahar hai\.\`\s*\);\s*\}\s*\}/m;

const originalLogic = `    const matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);

    if (!matchedCategory) {

      isEligible = false;

      reasons.push(

        \`Meter category "\${meterCategory || 'Unknown'}" admin settings me configured nahi hai ya bill se detect nahi ho paayi.\`

      );

    } else {

      if (!matchedCategory.eligible) {

        isEligible = false;

        reasons.push(\`\${matchedCategory.category} category solar ke liye eligible nahi hai (admin setting).\`);

      }

      if (

        billAmount < matchedCategory.minMonthlyBill ||

        billAmount > matchedCategory.maxMonthlyBill

      ) {

        isEligible = false;

        reasons.push(

          \`Bill amount \${currency}\${billAmount} is category ke allowed range (???\${matchedCategory.minMonthlyBill}??????\${matchedCategory.maxMonthlyBill}) se bahar hai.\`

        );

      }

    }`;

if (regex.test(content)) {
    content = content.replace(regex, originalLogic);
    fs.writeFileSync('src/controllers/lightBillEligibilityController.js', content);
    console.log("Reverted backend hack.");
} else {
    console.log("Backend hack not found.");
}
