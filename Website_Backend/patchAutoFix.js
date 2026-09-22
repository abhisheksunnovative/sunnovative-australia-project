import fs from 'fs';

let content = fs.readFileSync('src/controllers/billTemplateController.js', 'utf8');

// Replace everything from "// Cleanup potential markdown" to the end of autoGenerateAliases
const oldPartRegex = /\/\/ Cleanup potential markdown[\s\S]*?res\.status\(500\)\.json\({ success: false, message: error\.message \|\| 'Failed to parse file' }\);\n  }\n};/m;

const newPart = `// Cleanup potential markdown
    if (jsonString.startsWith('\`\`\`json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('\`\`\`')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('\`\`\`')) jsonString = jsonString.slice(0, -3);
    
    // Array extraction safeguard (since we asked for an array)
    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.slice(firstBracket, lastBracket + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString.trim());
    } catch (parseErr) {
      console.error('[Gemini Aliases] JSON parse failed:', parseErr.message, '| String was:', jsonString);
      return res.status(200).json({
        success: true,
        data: [],
        warning: 'AI response could not be parsed. Please fill labels manually.'
      });
    }
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
       console.warn('[Gemini Aliases] Warning: Gemini did not return an array. Wrapping in array.');
       parsed = [parsed];
    }

    console.log('[Gemini Aliases] ✅ success');
    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error auto-generating aliases with Gemini:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to parse file' });
  }
};`;

content = content.replace(oldPartRegex, newPart);

fs.writeFileSync('src/controllers/billTemplateController.js', content);
console.log("billTemplateController.js autoGenerateAliases fixed.");
