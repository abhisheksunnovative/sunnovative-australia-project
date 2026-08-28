const fs = require('fs');
let text = fs.readFileSync('Website_Backend/src/controllers/bdeController.js', 'utf-8');

const oldUpdates = "const updates = ['name', 'mobile', 'email', 'district', 'state', 'pincode', 'address', 'kw', 'billAmount', 'solarType', 'notes', 'consumerNumber', 'discom', 'tariff', 'meterCategory', 'billUrl', 'nmi', 'rooftopPhoto', 'retailer', 'subsidy', 'propertyType', 'roofType'];";
const newUpdates = "const updates = ['name', 'mobile', 'email', 'district', 'state', 'pincode', 'address', 'kw', 'billAmount', 'solarType', 'notes', 'consumerNumber', 'discom', 'tariff', 'meterCategory', 'billUrl', 'nmi', 'rooftopPhoto', 'retailer', 'subsidy', 'propertyType', 'roofType', 'isEligibleForInstallation'];";

text = text.replace(oldUpdates, newUpdates);
fs.writeFileSync('Website_Backend/src/controllers/bdeController.js', text);
