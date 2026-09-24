const fs = require('fs');
const path = 'd:/sunnovative-australia-website/Website_Backend/src/models/BillTemplate.js';
let code = fs.readFileSync(path, 'utf8');

// Insert unique index at the end of the schema definition
if (!code.includes('billTemplateSchema.index({ country: 1, discomName: 1 }')) {
    code = code.replace(
        'export default mongoose.model(\'BillTemplate\', billTemplateSchema);',
        'billTemplateSchema.index({ country: 1, discomName: 1 }, { unique: true });\n\nexport default mongoose.model(\'BillTemplate\', billTemplateSchema);'
    );
    fs.writeFileSync(path, code);
    console.log("Added unique index on country+discomName to BillTemplate schema!");
} else {
    console.log("Index already exists.");
}
