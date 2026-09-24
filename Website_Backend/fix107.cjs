const text = `Payment number 234 567 8910\nDue 15 Oct 2016 $85.10\nHow much energy`;
const regex = /(?:\$)[\s\n:]{0,50}?([0-9,]+(?:\.[0-9]+)?)(?=[\s\n]*How[\s\n]+much[\s\n]+energy)/i;
console.log(text.match(regex));
