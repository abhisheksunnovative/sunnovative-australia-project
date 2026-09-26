const axios = require('axios');

async function test() {
    try {
        const payload = {
            rawText: "Readings KWH Tariff Meter Chg\\nPresent 17108 RGPU A\\n",
            selectedText: "RGPU",
            fieldName: "tariffCategory",
            ruleType: "string",
            wordsWithPositions: [
                { text: "Tariff", x: 100, y: 100 },
                { text: "Meter", x: 200, y: 100 },
                { text: "RGPU", x: 105, y: 120 },
                { text: "A", x: 205, y: 120 }
            ],
            override: {
                heading: "Tariff",
                mainData: "RGPU",
                matchStrategy: "column-below",
                trailing: "" // FORCE NO TRAILING
            }
        };
        const res = await axios.post('http://localhost:4005/api/v2/bill-templates/generate-from-selection', payload);
        console.log(res.data);
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
