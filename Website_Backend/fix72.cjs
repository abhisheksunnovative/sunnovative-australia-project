const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/routes/billTemplateRoutes.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import { createTemplate, getTemplates, updateTemplate, autoGenerateAliases } from '../controllers/billTemplateController.js';",
  "import { createTemplate, getTemplates, updateTemplate, autoGenerateAliases, generateRegexFromSelection } from '../controllers/billTemplateController.js';"
);

code = code.replace(
  "router.post('/auto-generate', upload.single('billFile'), autoGenerateAliases);",
  "router.post('/auto-generate', upload.single('billFile'), autoGenerateAliases);\nrouter.post('/generate-from-selection', generateRegexFromSelection);"
);

fs.writeFileSync(path, code);
console.log("Patched billTemplateRoutes.js!");
