const fs = require('fs');

// 1. Add controller function
let controller = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');
const fixCode = `
export const fixDistricts = async (req, res) => {
  try {
    const { ProjectOrder } = await import("../models/ProjectModel.js");
    const docs = await ProjectOrder.find({ "location.district": { $in: [null, "", undefined] } });
    let count = 0;
    for (const d of docs) {
      const l = await Lead.findOne({ convertedProjectId: d._id });
      if (l) {
        d.location = d.location || {};
        d.location.district = l.district || l.city || 'Unknown';
        await d.save();
        count++;
      } else {
        d.location = d.location || {};
        d.location.district = 'Unknown';
        await d.save();
        count++;
      }
    }
    res.json({ success: true, message: "Fixed " + count + " projects!" });
  } catch(e) {
    res.json({ success: false, message: e.message });
  }
};
`;
if (!controller.includes('fixDistricts')) {
  fs.appendFileSync('../Website_Backend/src/controllers/leadController.js', fixCode);
}

// 2. Add route
let routes = fs.readFileSync('../Website_Backend/src/routes/leadRoutes.js', 'utf8');
if (!routes.includes('fixDistricts')) {
  routes = routes.replace(
    "import { createLead,",
    "import { fixDistricts, createLead,"
  );
  routes += `\nrouter.get('/fix-districts', fixDistricts);\n`;
  fs.writeFileSync('../Website_Backend/src/routes/leadRoutes.js', routes);
}
