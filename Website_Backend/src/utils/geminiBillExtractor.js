import { GoogleGenerativeAI } from '@google/generative-ai';

export const parseAuBillWithGemini = async (fileBuffer, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-3.6-flash as it's fast, multimodal and supports JSON schema
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: 'application/json' } });

  const prompt = `
You are an expert Australian electricity bill parser. Extract the following details from the attached bill image/PDF.
Respond ONLY with a valid JSON object matching the schema below. Do not include markdown formatting like \`\`\`json.
If a field is not found or cannot be determined, set its value to null.

Schema:
{
  "retailer": "string (e.g. AGL, Origin Energy, Alinta Energy, EnergyAustralia, etc.)",
  "accountNumber": "string (the customer's account number)",
  "nmiNumber": "string (10 or 11 digit National Metering Identifier)",
  "customerName": "string",
  "distributor": "string (the DNSP or distributor)",
  "suburb": "string",
  "state": "string (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)",
  "postcode": "string (4-digit Australian postcode)",
  "billingPeriodFrom": "string (DD MMM YYYY)",
  "billingPeriodTo": "string (DD MMM YYYY)",
  "billingDays": "number (integer)",
  "quarterlyKwh": "number (total electricity usage in kWh for the period)",
  "dailyKwh": "number (average daily electricity usage in kWh)",
  "quarterlyBillAmount": "number (total amount due on the bill, without $)",
  "solarExportKwh": "number (feed-in or exported solar in kWh, if any)",
  "solarExportCredit": "number (feed-in or exported solar credit amount, if any)",
  "tariffType": "string (e.g. Time of Use (TOU), Single Rate, Controlled Load, etc. Peak/Off-Peak implies TOU)",
  "meterType": "string (e.g. Smart Meter, Interval Meter, Basic Meter)"
}
`;

  const imageParts = [
    {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
      },
    },
  ];

  
  let result;
  let retries = 3;
  while (retries > 0) {
    try {
      result = await model.generateContent([prompt, ...imageParts]);
      break; // Success
    } catch (err) {
      if (err.message.includes('503') && retries > 1) {
        console.log('Gemini 503 error, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      } else {
        throw err;
      }
    }
  }

  const responseText = result.response.text();
  
  // Clean up potential markdown formatting
  let jsonString = responseText.trim();
  if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
  if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
  if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
  
  const parsed = JSON.parse(jsonString.trim());
  
  // Validate and map to the format expected by the controller
  return {
    country: 'australia',
    confidence: 'high', // Gemini extraction is generally high confidence
    isGemini: true, // Flag to indicate AI extraction
    retailer: parsed.retailer,
    accountNumber: parsed.accountNumber,
    nmiNumber: parsed.nmiNumber,
    customerName: parsed.customerName,
    distributor: parsed.distributor,
    suburb: parsed.suburb,
    state: parsed.state,
    postcode: parsed.postcode,
    billingPeriodFrom: parsed.billingPeriodFrom,
    billingPeriodTo: parsed.billingPeriodTo,
    billingDays: parsed.billingDays,
    quarterlyKwh: parsed.quarterlyKwh,
    dailyKwh: parsed.dailyKwh,
    monthlyKwhEquivalent: parsed.quarterlyKwh ? Math.round(parsed.quarterlyKwh / 3) : null,
    quarterlyBillAmount: parsed.quarterlyBillAmount,
    monthlyBillEquivalent: parsed.quarterlyBillAmount ? Math.round(parsed.quarterlyBillAmount / 3) : null,
    solarExportKwh: parsed.solarExportKwh,
    solarExportCredit: parsed.solarExportCredit,
    tariffType: parsed.tariffType,
    meterType: parsed.meterType
  };
};
