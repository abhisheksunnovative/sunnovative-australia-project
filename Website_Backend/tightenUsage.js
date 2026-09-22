import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const oldUsage = `const usagePatterns = [
    /(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,`;

const newUsage = `const usagePatterns = [
    /(?<!(?:Daily|Average|Avg)\\s+)(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)/i,`;

if (content.includes(oldUsage.substring(0, 50))) {
    content = content.replace(/(?:Total\\s\*)?\(\?:Electricity\\s\*\)\?\(\?:Usage\|Used\|Consumption\|kWh\\s\*Used\|Units\\s\*Used\)\[\\s\\S\]\{0,40\}\?\(\[\\d,\]\+\(\?:\\.\\d\+\)\?\)\\s\*\(\?:kWh\|kW\|units\)/i, 
    '(?<!(?:Daily|Average|Avg)\\s+)(?:Total\\s*)?(?:Electricity\\s*)?(?:Usage|Used|Consumption|kWh\\s*Used|Units\\s*Used)[\\s\\S]{0,40}?([\\d,]+(?:\\.\\d+)?)\\s*(?:kWh|kW|units)');
    fs.writeFileSync('src/utils/Ocrextractor.js', content);
    console.log("Usage regex tightened in Ocrextractor.");
}
