export const matchTemplate = (rawText, template) => {
  let extracted = {};
  let fieldConfidence = {};

  const aliases = template.OCR_aliases_json || {};
  Object.keys(aliases).forEach((fieldCode) => {
    const patterns = aliases[fieldCode];
    let foundValue = null;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      const match = rawText.match(regex);
      if (match && match[1]) {
        foundValue = match[1].trim();
        fieldConfidence[fieldCode] = 0.90;
        break;
      }
    }
    
    if (foundValue) {
      extracted[fieldCode] = foundValue;
    } else {
      fieldConfidence[fieldCode] = 0.0;
    }
  });

  return { extracted, fieldConfidence };
};
