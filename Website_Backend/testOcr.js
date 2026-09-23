import { parseAuBillText } from './src/utils/Ocrextractor.js';

const text = `
Synergy
Total $85.10
This bill: 685
Your average daily usage 12.0175 units
Amount $15.08
`;

console.log(parseAuBillText(text));
