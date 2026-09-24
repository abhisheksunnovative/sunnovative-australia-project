const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/controllers/billTemplateController.js';
let code = fs.readFileSync(path, 'utf8');

const newCreateTemplate = `// 1. Create a new Template (Admin use)
export const createTemplate = async (req, res) => {
  try {
    if (!req.body.effective_from) {
      req.body.effective_from = new Date();
    }
    req.body.engineVersion = 'v2.4_latest';
    req.body.isActive = true;
    
    const template = await BillTemplate.findOneAndUpdate(
      { country: req.body.country, discomName: req.body.discomName },
      { $set: req.body },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};`;

code = code.replace(/\/\/ 1\. Create a new Template \(Admin use\)[\s\S]*?res\.status\(400\)\.json\(\{ success: false, message: error\.message \}\);\n\s*\}\n\s*\};/, newCreateTemplate);

fs.writeFileSync(path, code);
console.log("Replaced createTemplate with Upsert logic.");
