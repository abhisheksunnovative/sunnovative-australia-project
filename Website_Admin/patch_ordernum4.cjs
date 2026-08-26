const fs = require('fs');
let c = fs.readFileSync('../Website_Backend/src/models/ProjectModel.js', 'utf8');

c = c.replace(
  'const count = await mongoose.model("ProjectOrder").countDocuments();\n    this.orderNumber = `SUN-${year}-${String(count + 1).padStart(4, "0")}`;',
  `const Model = mongoose.model("ProjectOrder");
    const highestOrder = await Model.findOne({ orderNumber: new RegExp(\`^SUN-\${year}-\`) })
                                   .sort({ orderNumber: -1 })
                                   .select('orderNumber')
                                   .lean();
    let nextNum = 1;
    if (highestOrder && highestOrder.orderNumber) {
      const parts = highestOrder.orderNumber.split('-');
      if (parts.length === 3) {
        nextNum = parseInt(parts[2], 10) + 1;
      }
    }
    
    let unique = false;
    while (!unique) {
      const candidate = \`SUN-\${year}-\${String(nextNum).padStart(4, "0")}\`;
      const exists = await Model.exists({ orderNumber: candidate });
      if (exists) {
        nextNum++;
      } else {
        this.orderNumber = candidate;
        unique = true;
      }
    }`
);

fs.writeFileSync('../Website_Backend/src/models/ProjectModel.js', c);
console.log("Patched ProjectModel.js with robust orderNumber generator");
