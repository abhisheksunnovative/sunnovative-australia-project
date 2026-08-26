const fs = require('fs');
let c = fs.readFileSync('../Website_Backend/src/models/ProjectModel.js', 'utf8');

c = c.replace(
  'const count = await mongoose.model("ProjectOrder").countDocuments();',
  `const lastOrder = await mongoose.model("ProjectOrder").findOne().sort({ createdAt: -1 });
    let count = 0;
    if (lastOrder && lastOrder.orderNumber) {
      const parts = lastOrder.orderNumber.split('-');
      if (parts.length === 3) {
        count = parseInt(parts[2], 10);
      }
    }`
);

fs.writeFileSync('../Website_Backend/src/models/ProjectModel.js', c);
console.log("Replaced!");
