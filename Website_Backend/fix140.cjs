const rawText = `The amount due from your previous    1   SAMPLE COMPANY NAME\ninvoice.    123 SAMPLE ROAD`;
const regexStr = "(?:from[\\s\\n]+your[\\s\\n]+previous)[\\s\\n:$,\\-]{0,50}?([A-Za-z\\s\\.\\'-]{2,50})(?=[\\s\\S]{0,150}?invoice\\.[\\s\\n]+SAMPLE)";
const testRegex = new RegExp(regexStr, 'i');
console.log(rawText.match(testRegex));
