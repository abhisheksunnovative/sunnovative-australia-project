const text = `This bill: 685\nLast bill: 1053`;
const regex = new RegExp('(?:This[\\s\\n]+bill:)[\\s\\n:]{0,50}?([0-9,]+(?:\\.[0-9]+)?)(?=[\\s\\n]*Last[\\s\\n]+bill:)', 'i');
console.log(text.match(regex));
