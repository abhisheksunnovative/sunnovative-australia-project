const fs = require('fs');
let c = fs.readFileSync('../Website_Backend/src/models/ProjectModel.js', 'utf8');

c = c.replace(
  'const count = await mongoose.model("ProjectOrder").countDocuments();\n    this.orderNumber = `SUN-${year}-${String(count + 1).padStart(4, "0")}`;',
  `const lastOrder = await mongoose.model("ProjectOrder").findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const parts = lastOrder.orderNumber.split('-');
      if (parts.length === 3) {
        nextNum = parseInt(parts[2], 10) + 1;
      }
    }
    this.orderNumber = \`SUN-\${year}-\${String(nextNum).padStart(4, "0")}\`;`
);

fs.writeFileSync('../Website_Backend/src/models/ProjectModel.js', c);
