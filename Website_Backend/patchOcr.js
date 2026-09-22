import fs from 'fs';

let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

// Remove city, district, postcode from final JSON returned by Ocrextractor
content = content.replace(/city:\s*city,/g, "");
content = content.replace(/district:\s*district,/g, "");
content = content.replace(/postcode:\s*postcode,/g, "");

fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Ocrextractor.js updated to remove city, district, postcode");
