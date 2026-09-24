const rawText = `Due 15 Oct 2016 $85.10`;
const regexStr = '(?:Due)[\\s\\n:$£€,-]{0,50}?([0-9,]+(?:\\.[0-9]+)?)';
const testRegex = new RegExp(regexStr, 'i');
console.log(rawText.match(testRegex));
