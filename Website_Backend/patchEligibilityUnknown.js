import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillEligibilityController.js', 'utf8');

const oldLogic = `    const matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);

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

// Use robust regex to handle \r\n and whitespace variations
const regex = /const matchedCategory = matchMeterCategory\(meterCategory, rules\.meterCategories \|\| \[\]\);[\s\S]*?se bahar hai\.\`\s*\);\s*\}\s*\}/m;

const newLogic = `    let matchedCategory = matchMeterCategory(meterCategory, rules.meterCategories || []);

    if (!matchedCategory) {
      // Fallback for unknown categories to avoid blocking leads
      matchedCategory = (rules.meterCategories || []).find(c => c.eligible) || {
        category: 'Unknown/Fallback',
        eligible: true,
        minMonthlyBill: 0,
        maxMonthlyBill: 999999
      };
      // Log it but don't fail eligibility
      reasons.push(\`Unmapped category "\${meterCategory || 'Unknown'}". Using default eligible fallback rules.\`);
    }

    if (!matchedCategory.eligible) {
      isEligible = false;
      reasons.push(\`\${matchedCategory.category} category solar ke liye eligible nahi hai (admin setting).\`);
    } else if (
      billAmount < matchedCategory.minMonthlyBill ||
      billAmount > matchedCategory.maxMonthlyBill
    ) {
      isEligible = false;
      reasons.push(
        \`Bill amount \${currency}\${billAmount} allowed range (\${currency}\${matchedCategory.minMonthlyBill}-\${currency}\${matchedCategory.maxMonthlyBill}) se bahar hai.\`
      );
    }`;

if (regex.test(content)) {
    content = content.replace(regex, newLogic);
    fs.writeFileSync('src/controllers/lightBillEligibilityController.js', content);
    console.log("Eligibility controller updated with unknown category fallback!");
} else {
    console.log("Could not match the meter category block.");
}
