import fs from 'fs';

let content = fs.readFileSync('src/controllers/lightBillEligibilityController.js', 'utf8');

const oldExport = `export const checkBillEligibility = async (req, res) => {

  try {

    const {`;

const newExport = `export const checkBillEligibility = async (req, res) => {
  try {
    const { isCustomerVerified, criticalFieldsConfirmed } = req.body;
    
    // RECOMMENDATION SAFETY GATE
    // If critical fields were not confident during scan, and the customer hasn't explicitly verified them:
    if (!isCustomerVerified && criticalFieldsConfirmed === false) {
        return res.status(400).json({
            success: false,
            error: "CRITICAL_FIELDS_UNVERIFIED",
            message: "Critical recommendation fields (Bill Amount, Units, or Tariff) were not scanned with 100% confidence. Please confirm the values before generating recommendations."
        });
    }

    const {`;

content = content.replace(oldExport, newExport);
fs.writeFileSync('src/controllers/lightBillEligibilityController.js', content);
console.log("Eligibility Controller updated with Safety Gate.");
