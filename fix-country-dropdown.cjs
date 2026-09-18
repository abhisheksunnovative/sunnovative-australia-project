const fs = require('fs');
let code = fs.readFileSync('Website_Frontend/src/customer/CustomerLogin.jsx', 'utf8');

code = code.replace(
  'value={country ? country.toLowerCase() : ""}',
  'value={country === "IN" ? "india" : country === "AU" ? "australia" : country === "NZ" ? "newzealand" : (country ? country.toLowerCase() : "")}'
);

fs.writeFileSync('Website_Frontend/src/customer/CustomerLogin.jsx', code);
