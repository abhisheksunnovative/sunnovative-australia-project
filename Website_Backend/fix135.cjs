const rawText = `Due 15 Oct 2016  $85.10 \n 3   Customer details`;
const regexStr = '(?:Due)[\\s\\n:$,\\-]{0,50}?([0-9]{1,2}\\s+[A-Za-z]{3,9}\\s+[0-9]{2,4})(?=[\\s\\S]{0,150}?Customer[\\s\\n]+details)';
const testRegex = new RegExp(regexStr, 'i');
console.log(rawText.match(testRegex));
