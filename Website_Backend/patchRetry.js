import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

const oldCall = `    console.log('[Gemini Aliases] Sending file to Gemini...');
    const result = await model.generateContent([prompt, ...imageParts]);`;

const newCall = `    console.log('[Gemini Aliases] Sending file to Gemini...');
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent([prompt, ...imageParts]);
        break;
      } catch (err) {
        if (err.message && err.message.includes('503') && retries > 1) {
          console.warn(\`[Gemini] 503 error, retrying in 2 seconds... (\${retries - 1} retries left)\`);
          await new Promise(res => setTimeout(res, 2000));
          retries--;
        } else {
          throw err;
        }
      }
    }`;

content = content.replace(oldCall, newCall);

fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("Retry logic added to autoGenerateAliases");
