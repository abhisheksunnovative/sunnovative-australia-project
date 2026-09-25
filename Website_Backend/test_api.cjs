const axios = require('axios');

async function test() {
  try {
    const rawText = "SDO Name : Rajkot-Madhapar GST No. 24AADCP1453C1ZZ Help Line 1800 233 155333\nVAJAR TRUPTI BHAVESHBHAI\nAMRUT SARITA PL-9";
    const selectedText = "VAJAR TRUPTI BHAVESHBHAI";
    
    const res = await axios.post('http://localhost:4005/api/v2/bill-templates/generate-from-selection', {
      rawText,
      selectedText,
      fieldName: 'fullName',
      selectionIndex: rawText.indexOf(selectedText)
    });
    console.log(res.data);
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}

test();
