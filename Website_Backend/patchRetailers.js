import fs from 'fs';
let content = fs.readFileSync('src/utils/Ocrextractor.js', 'utf8');

const regex = /const AU_RETAILERS = \[[\s\S]*?\];/m;
const newArr = `const AU_RETAILERS = [
  { id: 'ActewAGL',          pattern: /ActewAGL/i },
  { id: 'EnergyAustralia',   pattern: /Energy\\s*Australia/i },
  { id: 'Aurora Energy',     pattern: /Aurora\\s*Energy/i },
  { id: 'Ergon Energy',      pattern: /Ergon\\s*Energy/i },
  { id: 'SA Power Networks', pattern: /SA\\s*Power\\s*Networks?/i },
  { id: 'Endeavour Energy',  pattern: /Endeavour\\s*Energy/i },
  { id: 'Essential Energy',  pattern: /Essential\\s*Energy/i },
  { id: 'AusNet Services',   pattern: /AusNet\\s*(?:Services)?/i },
  { id: 'Momentum Energy',   pattern: /Momentum\\s*Energy/i },
  { id: 'Simply Energy',     pattern: /Simply\\s*Energy/i },
  { id: 'Alinta Energy',     pattern: /Alinta\\s*Energy/i },
  { id: 'Horizon Power',     pattern: /Horizon\\s*Power/i },
  { id: 'Lumo Energy',       pattern: /Lumo\\s*Energy/i },
  { id: 'Red Energy',        pattern: /Red\\s*Energy/i },
  { id: 'Origin Energy',     pattern: /\\bOrigin\\b/i },
  { id: 'AGL',               pattern: /\\bAGL\\b|AGL\\s*Energy/i },
  { id: 'Synergy',           pattern: /\\bSynergy\\b/i },
  { id: 'Powercor',          pattern: /Powercor/i },
  { id: 'CitiPower',         pattern: /CitiPower/i },
  { id: 'Jemena',            pattern: /Jemena/i },
  { id: 'Ausgrid',           pattern: /Ausgrid/i },
  { id: 'Energex',           pattern: /Energex/i },
  { id: 'Evoenergy',         pattern: /Evoenergy/i },
];`;

content = content.replace(regex, newArr);
fs.writeFileSync('src/utils/Ocrextractor.js', content);
console.log("Regex replaced AU_RETAILERS");
