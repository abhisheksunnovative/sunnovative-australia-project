const fs = require('fs');

let controller = fs.readFileSync('../Website_Backend/src/controllers/leadController.js', 'utf8');

const dynamicPaymentBlock = `
    // ?????? Dynamic Payment Stages Initialization ??????
    try {
      const CustomerPaymentSettings = (await import("../models/CustomerPaymentSettings.js")).default;
      let searchCountry = (po.country || "india").toLowerCase().trim();
      if (searchCountry === "au") searchCountry = "australia";
      if (searchCountry === "in") searchCountry = "india";

      const adminPaymentDoc = await CustomerPaymentSettings.findOne({ country: searchCountry });
      const adminConfig = adminPaymentDoc?.projectConfigs?.find(c => c.projectType.toLowerCase() === po.projectType.toLowerCase());

      po.stagePayments = [];
      if (adminConfig && adminConfig.paymentStages && adminConfig.paymentStages.length > 0) {
        const totalCost = po.totalProjectCost || 0;
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
            gatewayRequired: stage.gatewayRequired !== false,
            razorpayOrderId: "",
            razorpayPaymentId: "",
            razorpaySignature: "",
            paidAt: null
          });
        }
      }
    } catch (err) {
      console.error("Error initializing stagePayments:", err);
    }
    // ?????????????????????????????????????????????????????????????????????????????????????????
`;

if (!controller.includes('// ?????? Dynamic Payment Stages Initialization ??????')) {
  controller = controller.replace(
    'await po.save();',
    dynamicPaymentBlock + '\n    await po.save();'
  );
  fs.writeFileSync('../Website_Backend/src/controllers/leadController.js', controller);
  console.log("Patched convertLeadToProject with dynamic payment stages!");
} else {
  console.log("Already patched.");
}
