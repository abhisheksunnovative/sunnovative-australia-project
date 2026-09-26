const fs = require('fs');
const { extractRawText } = require('./src/utils/billParser.js'); // ES module?
// billParser is an ES module. I have to use dynamic import.

(async () => {
    try {
        const billParser = await import('./src/utils/billParser.js');
        const fileBuffer = fs.readFileSync('uploads/file-1790147131021-369710380.pdf');
        const { rawText, wordsWithPositions } = await billParser.extractRawText(fileBuffer, 'application/pdf');
        
        console.log("Found words:", wordsWithPositions.length);
        const consWords = wordsWithPositions.filter(w => w.text.toLowerCase().includes('con'));
        console.log("Words with 'con':", consWords);
        
        const tariffWords = wordsWithPositions.filter(w => w.text.toLowerCase().includes('tariff'));
        console.log("Words with 'tariff':", tariffWords);
    } catch(e) {
        console.error(e);
    }
})();
