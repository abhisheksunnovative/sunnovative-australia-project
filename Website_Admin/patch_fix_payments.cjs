const fs = require('fs');

let controller = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');
const fixCode = `
export const fixPayments = async (req, res) => {
  try {
    const { ProjectOrder } = await import("../models/ProjectModel.js");
    const CustomerPaymentSettings = (await import("../models/CustomerPaymentSettings.js")).default;
    const docs = await ProjectOrder.find();
    let count = 0;
    for (const po of docs) {
      if (!po.stagePayments || po.stagePayments.length === 0) {
        let searchCountry = (po.country || "india").toLowerCase().trim();
        if (searchCountry === "au") searchCountry = "australia";
        if (searchCountry === "in") searchCountry = "india";

        const adminPaymentDoc = await CustomerPaymentSettings.findOne({ country: searchCountry });
        if (adminPaymentDoc) {
          const adminConfig = adminPaymentDoc.projectConfigs?.find(c => c.projectType.toLowerCase() === po.projectType.toLowerCase());
          if (adminConfig && adminConfig.paymentStages && adminConfig.paymentStages.length > 0) {
            const totalCost = po.totalProjectCost || 0;
            po.stagePayments = [];
            for (const stage of adminConfig.paymentStages) {
              let value = stage.defaultValue || 0;
              if (value > stage.maxLimit) value = stage.maxLimit;
              let calculatedAmount = stage.valueType === "fixed" ? value : Math.round(totalCost * (value / 100));

              po.stagePayments.push({
                stageKey: stage.stageKey,
                label: stage.label,
                valueType: stage.valueType,
                value: value,
                amount: calculatedAmount,
                status: "not_required",
                isMandatory: !!stage.isMandatory,
                recipientType: stage.recipientType || "epc",
                gatewayRequired: stage.gatewayRequired !== false
              });
            }
            await po.save();
            count++;
          }
        }
      }
    }
    res.json({ success: true, message: "Fixed payments for " + count + " projects!" });
  } catch(e) {
    res.json({ success: false, message: e.message });
  }
};
`;
if (!controller.includes('export const fixPayments = async')) {
  fs.appendFileSync('../Website_Backend/src/controllers/leadController.js', fixCode);
}

let routes = fs.readFileSync('../Website_Backend/src/routes/leadRoutes.js', 'utf8');
if (!routes.includes('fixPayments')) {
  routes = routes.replace(
    "import { fixDistricts, createLead,",
    "import { fixPayments, fixDistricts, createLead,"
  );
  routes += `\nrouter.get('/fix-payments', fixPayments);\n`;
  fs.writeFileSync('../Website_Backend/src/routes/leadRoutes.js', routes);
}
