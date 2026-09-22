import fs from 'fs';

let content = fs.readFileSync('src/utils/billParser.js', 'utf8');

// Fix Blur Detection (Adding offset to prevent negative clamping in Laplacian convolution)
content = content.replace(
    /kernel: \[0, 1, 0, 1, -4, 1, 0, 1, 0\]\n\s+\}\)/,
    `kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],\n                offset: 128\n            })`
);

fs.writeFileSync('src/utils/billParser.js', content);
console.log("Blur detection patched.");
