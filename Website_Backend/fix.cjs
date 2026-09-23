const fs = require('fs');

// 1. BillTemplate.js
const btPath = 'd:/sunnovative-australia-website/Website_Backend/src/models/BillTemplate.js';
let bt = fs.readFileSync(btPath, 'utf8');
bt = bt.replace(
  'isActive: { type: Boolean, default: true },',
  'isActive: { type: Boolean, default: false },\n  status: { type: String, enum: [\'pending_review\', \'approved\', \'rejected\'], default: \'pending_review\' },\n  engineVersion: { type: String, default: \'unknown\' },'
);
fs.writeFileSync(btPath, bt);

// 2. templateExtractor.js
const tePath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/templateExtractor.js';
let te = fs.readFileSync(tePath, 'utf8');
te = te.replace(
  'const templates = await BillTemplate.find({ country: countryContext, isActive: true });',
  'const templates = await BillTemplate.find({ country: countryContext, isActive: true, status: \'approved\' });'
);
fs.writeFileSync(tePath, te);

// 3. billTemplateController.js
const btcPath = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let btc = fs.readFileSync(btcPath, 'utf8');
btc = btc.replace(
  'const template = await BillTemplate.create(req.body);\n    res.status(201).json({ success: true, data: template });',
  'const newTemplate = new BillTemplate({\n      ...req.body,\n      status: \'pending_review\',\n      isActive: false,\n      engineVersion: \'v2.2\',\n    });\n    const template = await newTemplate.save();\n    res.status(201).json({ success: true, data: template });'
);
btc += `

// PATCH /api/admin/bill-templates/:id/approve
export const approveTemplate = async (req, res) => {
  try {
    const template = await BillTemplate.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isActive: true },
      { new: true }
    );
    res.json({ success: true, template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/bill-templates/stale
export const getStaleTemplates = async (req, res) => {
  try {
    const stale = await BillTemplate.find({ engineVersion: { $ne: 'v2.2' }, isActive: true });
    res.json({ count: stale.length, templates: stale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
fs.writeFileSync(btcPath, btc);

// 4. Ocrextractor.js
const ocrPath = 'd:/sunnovative-australia-website/Website_Backend/src/utils/Ocrextractor.js';
let ocr = fs.readFileSync(ocrPath, 'utf8');
ocr = ocr.replace(
  'import { getStateSubsidyData } from \'./stateSubsidyData.js\';\n\nlet globalScheduler = null;',
  'import { getStateSubsidyData } from \'./stateSubsidyData.js\';\n\nexport const ENGINE_VERSION = \'v2.2\';\n\nlet globalScheduler = null;'
);

const oldAddressBlock = `  // ── 4. Address — Suburb, State, Postcode ──────────────────────────────────
  let suburb = null, state = null, postcode = null;

  // Australian postcode: 4 digits, 2000-9999 or 0800-0999
  // State code (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)
  const stateMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b/);
  if (stateMatch) state = AU_STATE_MAP[stateMatch[1]] || stateMatch[1];

  // Phase 2 Fix: Context-aware Postcode match (to avoid years like 2026)
  const postcodeStateMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\s+(\\d{4})\\b/);
  if (postcodeStateMatch) {
    postcode = postcodeStateMatch[2];
  } else {
    // Fallback: look near "Address" or "Supply"
    const postcodeAddressMatch = t.match(/(?:Address|Supply|Site)[\\s\\S]{0,150}?\\b(0[89]\\d{2}|[2-9]\\d{3})\\b/i);
    if (postcodeAddressMatch) postcode = postcodeAddressMatch[1];
  }`;

const newAddressBlock = `  // ── 4. Address — Suburb, State, Postcode ──────────────────────────────────
  let suburb = null, state = null, postcode = null;

  const supplyBlockMatch = t.match(/(?:Supply\\s*address|Service\\s*address|Site\\s*address)[\\s\\S]{0,120}?\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\s+(\\d{4})\\b/i);
  if (supplyBlockMatch) {
    state = AU_STATE_MAP[supplyBlockMatch[1].toUpperCase()] || supplyBlockMatch[1];
    postcode = supplyBlockMatch[2];
  }

  if (!state) {
    const allMatches = [...t.matchAll(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\s+(\\d{4})\\b/g)];
    if (allMatches.length > 0) {
      const freq = {};
      allMatches.forEach(m => {
        const key = \`\${m[1]}|\${m[2]}\`;
        freq[key] = (freq[key] || 0) + 1;
      });
      const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      const [st, pc] = mostCommon.split('|');
      state = AU_STATE_MAP[st.toUpperCase()] || st;
      postcode = pc;
    }
  }

  let stateMatch = null;
  if (!state) {
    stateMatch = t.match(/\\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\\b/);
    if (stateMatch) state = AU_STATE_MAP[stateMatch[1]] || stateMatch[1];
  } else {
    const abbr = Object.keys(AU_STATE_MAP).find(key => AU_STATE_MAP[key] === state) || state;
    if (postcode) {
      stateMatch = t.match(new RegExp(\`\\\\b\${abbr}\\\\s+\${postcode}\\\\b\`));
    }
    if (!stateMatch) {
      stateMatch = t.match(new RegExp(\`\\\\b\${abbr}\\\\b\`));
    }
  }`;

let replacedOcr = ocr.replace(oldAddressBlock, newAddressBlock);
if (replacedOcr === ocr) {
  replacedOcr = ocr.replace(oldAddressBlock.replace(/\n/g, '\r\n'), newAddressBlock);
}
fs.writeFileSync(ocrPath, replacedOcr);
if(replacedOcr === ocr) console.log('Ocrextractor replacement failed');
else console.log('All patches applied successfully!');
