import fs from 'fs';

let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const oldAddress = `  // Australian postcode: 4 digits, 2000-9999 or 0800-0999
  // State code (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
  const stateMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b/);
  if (stateMatch) state = AU_STATE_MAP[stateMatch[1]] || stateMatch[1];

  const postcodeMatch = t.match(/\\b([0-9]{4})\\b/);
  if (postcodeMatch) postcode = postcodeMatch[1];`;

const newAddress = `  // Prioritize State + Postcode together
  const statePostcodeMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\s+([0-9]{4})\\b/);
  if (statePostcodeMatch) {
    state = AU_STATE_MAP[statePostcodeMatch[1]] || statePostcodeMatch[1];
    postcode = statePostcodeMatch[2];
  } else {
    const stateMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b/);
    if (stateMatch) state = AU_STATE_MAP[stateMatch[1]] || stateMatch[1];
    
    // Look for a 4-digit number that isn't a year
    const postcodes = [...t.matchAll(/\\b([0-9]{4})\\b/g)];
    for (const match of postcodes) {
      const p = parseInt(match[1], 10);
      if ((p >= 800 && p <= 999) || (p >= 2000 && p <= 9999)) {
        if (p < 1900 || p > 2099) { // Ignore likely years
          postcode = match[1];
          break;
        }
      }
    }
  }`;

content = content.replace(oldAddress, newAddress);
fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Patched Postcode extraction");
