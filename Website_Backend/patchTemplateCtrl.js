import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

content = content.replace("await BillTemplate.find().populate('discom_id');", "await BillTemplate.find().sort({ createdAt: -1 });");

fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("billTemplateController.js fixed.");
