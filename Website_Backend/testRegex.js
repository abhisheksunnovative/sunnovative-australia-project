const str = "Issue date\n16 Oct 15";
const regex = /(?:Issue\s*Date|Date\s*of\s*Issue|Invoice\s*Date|Bill\s*Date|Statement\s*Date)\s*[:\-]?\s*([\d]{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|[\d]{1,2}[-/][\d]{1,2}[-/][\d]{2,4})/i;
console.log("MATCH:", str.match(regex));
