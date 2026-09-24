const rawText = `different billing \n Mr S Sample   $0.00 \n This is the period`;
const regexStr = '(?:different[\\s\\n]+billing[\\s\\n]+Mr)[\\s\\n:$,\\-]{0,50}?([A-Za-z\\s\\.\\'-]{2,50})(?=[\\s\\S]{0,150}?This[\\s\\n]+is)';
const testRegex = new RegExp(regexStr, 'i');
console.log(rawText.match(testRegex));
