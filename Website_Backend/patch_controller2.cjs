const fs = require('fs');

let c = fs.readFileSync('src/controllers/bdeController.js', 'utf8');

const regex = /export const scheduleAndQualifyLead = async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ success: false, message: error\.message \}\);\s*\}\s*\};/;

const replacement = fs.readFileSync('fix_schedule.js', 'utf8');

if (regex.test(c)) {
  c = c.replace(regex, replacement.trim());
  fs.writeFileSync('src/controllers/bdeController.js', c);
  console.log('Patched scheduleAndQualifyLead!');
} else {
  console.log("Could not find regex match!");
}
