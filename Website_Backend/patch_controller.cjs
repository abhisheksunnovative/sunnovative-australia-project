const fs = require('fs');
const file = 'src/controllers/lightBillScanController.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /if \(!req\.file\) \{[\s\S]*?message: 'Please upload a bill image \(JPG\/PNG\) or PDF\.',\s*\}\);\s*\}/;

const newCheck = `if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a bill image (JPG/PNG) or PDF.',
      });
    }

    // Save the file to disk so we can return a URL
    const ext = req.file.originalname.split('.').pop();
    const filename = \`bill-\${Date.now()}-\${Math.round(Math.random() * 1E9)}.\${ext}\`;
    const dir = './uploads/bills';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dir + '/' + filename, req.file.buffer);
    const fileUrl = '/uploads/bills/' + filename;
`;

code = code.replace(regex, newCheck);
code = code.replace(/extracted: \{/g, `fileUrl,
        extracted: {`);

fs.writeFileSync(file, code);
console.log("Patched controller with regex!");
