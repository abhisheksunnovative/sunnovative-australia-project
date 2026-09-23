import fs from 'fs';
let content = fs.readFileSync('src/controllers/lightBillScanController.js', 'utf8');

const regex = /\/\/ Average daily fallback for low kWh values \(e\.g\. Origin 27\.78, Horizon 25\)[\s\S]*?finalKwh = Math\.round\(finalKwh \* \(merged\.billingDays \|\| 90\)\);\s*\}/m;

if (regex.test(content)) {
  content = content.replace(regex, "// Fallback removed as per user request (no guess-multiply for low kWh)");
  fs.writeFileSync('src/controllers/lightBillScanController.js', content);
  console.log("Removed hack.");
} else {
  console.log("Hack not found.");
}
