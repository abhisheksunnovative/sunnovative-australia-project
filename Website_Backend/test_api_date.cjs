const axios = require('axios');

async function test() {
  try {
    const rawText = 'Max Dem Off Peak Dem Night Demand Meter status\\nLast Date For\\n2.60 17-08-2026\\nPayment\\nFor Online Payment.\\nReadings KWH Reactive Import Export Tariff Meter Chg Code H.p/K.V Seasonal\\nDays S.D.\\nPresent 17108 0\\nRGPU A 1.00 0 814.00\\nPast 16130 0';
    const selectedText = '17-08-2026';
    const override = { heading: 'Last Date', mainData: '17-08-2026', trailing: 'Payment Fo' };
    
    const res = await axios.post('http://localhost:4005/api/v2/bill-templates/generate-from-selection', {
      rawText,
      selectedText,
      fieldName: 'dueDate',
      override
    });
    console.log(res.data);
  } catch (e) {
    console.error("ERROR:", e.response ? e.response.data : e.message);
  }
}

test();
