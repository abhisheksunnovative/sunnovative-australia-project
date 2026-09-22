import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const oldBraceSafeguard = `    // Brace extraction safeguard
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }`;

const newBraceSafeguard = `    // Array/Object extraction safeguard
    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      jsonString = jsonString.slice(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }`;

content = content.replace(oldBraceSafeguard, newBraceSafeguard);
fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("billTemplateController.js fixed for Array JSON parsing.");
