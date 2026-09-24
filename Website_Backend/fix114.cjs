const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/models/ScanAnalytics.js';
let code = fs.readFileSync(path, 'utf8');

const target = `    needsTemplateCreation: {
        type: Boolean,
        default: false
    },`;
const replacement = `    needsTemplateCreation: {
        type: Boolean,
        default: false
    },
    resolvedTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BillTemplate',
        default: null
    },`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log("Added resolvedTemplateId to ScanAnalytics schema.");
