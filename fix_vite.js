const fs = require('fs');
let code = fs.readFileSync('d:/sunnovative-australia-website/Epc-Frontend/vite.config.js', 'utf8');
code = code.replace(/src:\s*'icon-192\.png',\s*sizes:\s*'512x512'/g, "src: 'icon-512.png',\n            sizes: '512x512'");
fs.writeFileSync('d:/sunnovative-australia-website/Epc-Frontend/vite.config.js', code);
console.log('Fixed');
