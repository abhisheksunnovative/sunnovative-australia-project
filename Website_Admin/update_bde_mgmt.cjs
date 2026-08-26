const fs = require('fs');

let c = fs.readFileSync('src/components/BDEManagementScreen.jsx', 'utf8');

c = c.replace(
  `<option value="Fixed">Fixed Amount per Conversion</option>`,
  `<option value="Fixed">Fixed Amount per Lead (On Conversion)</option>`
);

c = c.replace(
  `{formData.commissionType === "PerKW" ? "Amount per kW" : "Amount per Conversion"}`,
  `{formData.commissionType === "PerKW" ? "Amount per kW" : "Amount per Lead"}`
);

c = c.replace(
  `? \`Commission will credit \${selectedCountry === "australia" ? "AUD $" : "₹"}\${formData.commissionAmount} × System kW for every confirmed conversion.\``,
  `? \`Commission will credit \${selectedCountry === "australia" ? "AUD $" : "₹"}\${formData.commissionAmount} × System kW for every lead that converts to Order Journey.\``
);

c = c.replace(
  `: \`Commission will credit fixed \${selectedCountry === "australia" ? "AUD $" : "₹"}\${formData.commissionAmount} for every confirmed conversion.\``,
  `: \`Commission will credit fixed \${selectedCountry === "australia" ? "AUD $" : "₹"}\${formData.commissionAmount} for every lead that converts to Order Journey.\``
);

fs.writeFileSync('src/components/BDEManagementScreen.jsx', c);
console.log("Updated BDEManagementScreen.jsx");
