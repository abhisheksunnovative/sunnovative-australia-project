const fs = require('fs');
let c = fs.readFileSync('src/components/bde/BDEProspects.jsx', 'utf8');

const originalText = `<p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to pay token to start order journey</p>`;
const newText = `{!isAU ? (
        <p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to pay token to start order journey</p>
      ) : (
        <p className="text-[10px] font-bold text-rose-600 text-center uppercase">Ask customer to start Order Journey & make their first payment</p>
      )}`;

if (c.includes(originalText)) {
  c = c.replace(originalText, newText);
  fs.writeFileSync('src/components/bde/BDEProspects.jsx', c);
  console.log("Updated token text in Prospects!");
} else {
  console.log("Could not find the token text.");
}
