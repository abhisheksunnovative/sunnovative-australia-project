import { GoogleGenerativeAI } from '@google/generative-ai';

export const parseAuBillWithGemini = async (fileBuffer, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in .env');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-3.6-flash as it's fast, multimodal and supports JSON schema
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.6-flash', 
    generationConfig: { responseMimeType: 'application/json' } 
  });

  const prompt = `You are an expert electricity bill parser (Global, including Australia and India). Extract the following details from the attached bill image/PDF.
Respond ONLY with a valid JSON object matching the schema below. Do not include markdown formatting like \`\`\`json.
If a field is not found or cannot be determined, set its value to null.

Schema:
{
  "retailer": "string (e.g. AGL, Origin Energy, Tata Power, BESCOM, etc.)",
  "consumerNumber": "string (Consumer / Account Number)",
  "accountNumber": "string (the customer's account number, fallback for consumerNumber)",
  "nmiNumber": "string (10 or 11 digit National Metering Identifier if applicable)",
  "customerName": "string (Customer Name)",
  "distributor": "string (DISCOM / Utility)",
  "suburb": "string",
  "state": "string (State or province)",
  "postcode": "string",
  "billingPeriodFrom": "string (DD MMM YYYY)",
  "billingPeriodTo": "string (DD MMM YYYY)",
  "billingDays": "number (integer, total billing period duration in days)",
  "quarterlyKwh": "number (total Units Consumed in kWh for the period)",
  "dailyKwh": "number (average daily electricity usage in kWh)",
  "quarterlyBillAmount": "number (total Bill Amount due, numeric only)",
  "dueDate": "string (Due Date, DD MMM YYYY format if found)",
  "solarExportKwh": "number (feed-in or exported solar in kWh, if any)",
  "solarExportCredit": "number (feed-in or exported solar credit amount, if any)",
  "tariffType": "string (Tariff Category, e.g. Time of Use (TOU), Single Rate, LT-1, etc.)",
  "meterType": "string (Meter Information, e.g. Smart Meter, Interval Meter, Basic Meter, Phase)",
  "customerType": "string (Residential / Commercial Category)"
}`;

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
      console.log(`[Gemini Bill Extractor] Sending bill to Gemini...`);
      result = await model.generateContent([prompt, ...imageParts]);
      break; // Success
    } catch (err) {
      if (err.message.includes('503') || err.message.includes('fetch')) {
        console.warn(`[Gemini] Connection error, retrying in 2 seconds... (${retries - 1} left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      } else {
        throw err;
      }
    }
  }

  if (!result) {
    throw new Error('Gemini failed to return a response after retries.');
  }

  const responseText = result.response.text();
  
  // Clean up potential markdown formatting
  let jsonString = responseText.trim();
  if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
  if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
  if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
  
  // Brace extraction safeguard
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonString = jsonString.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(jsonString.trim());
  
  // Validate and map to the format expected by the controller
  return {
    country: 'australia',
    confidence: 'high', 
    isGemini: true,
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
    meterType: parsed.meterType,
    customerType: parsed.customerType
  };
};

export const extractRawTextWithGemini = async (fileBuffer, mimeType) => {
  if (!process.env.GEMINI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = "Please extract all the readable text from this electricity bill exactly as it appears. Preserve the logical layout and order.";
  const imageParts = [
    {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
      },
    },
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
  } catch (err) {
    console.warn("[Gemini] Raw text extraction failed, will fallback to Tesseract:", err.message);
    return null;
  }
};
