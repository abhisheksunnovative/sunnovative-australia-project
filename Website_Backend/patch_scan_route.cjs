const fs = require('fs');
const file = 'src/routes/lightBillScanRoutes.js';
let code = fs.readFileSync(file, 'utf8');

const newCode = code.replace(/const upload = multer\(\{[\s\S]*?storage: multer\.memoryStorage\(\),/m, `import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/bills';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, \`bill-\${Date.now()}-\${Math.round(Math.random() * 1E9)}.\${ext}\`);
  }
});

const upload = multer({
  storage: storage,`);

fs.writeFileSync(file, newCode);
console.log("Patched route!");
