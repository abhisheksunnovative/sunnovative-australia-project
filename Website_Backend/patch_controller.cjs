const fs = require('fs');

let c = fs.readFileSync('src/controllers/bdeController.js', 'utf8');

const oldStart = 'export const scheduleAndQualifyLead = async (req, res) => {';
const oldEnd = '  } catch (error) {\n    res.status(500).json({ success: false, message: error.message });\n  }\n};';

if (c.includes(oldStart) && c.includes(oldEnd)) {
  const p1 = c.split(oldStart);
  const remaining = p1[1];
  const p2 = remaining.split(oldEnd);
  
  const replacement = fs.readFileSync('fix_schedule.js', 'utf8');
  
  c = p1[0] + replacement + p2.slice(1).join(oldEnd);
  fs.writeFileSync('src/controllers/bdeController.js', c);
  console.log('Patched scheduleAndQualifyLead!');
} else {
  console.log("Could not find the block");
}
