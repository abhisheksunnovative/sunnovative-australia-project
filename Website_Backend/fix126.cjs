const text = `5\nDue 15 Oct 2016  $85.10`;
const regex = /(?:Due)[\s\n:$£€,-]{0,50}?([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{2,4})/i;
console.log(text.match(regex));
