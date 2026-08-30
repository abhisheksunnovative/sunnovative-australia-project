import OpenAI from 'openai';
import { convertScannedPdfToImages } from './Ocrextractor.js';

export const parseAuBillWithAI = async (fileBuffer, mimeType) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const prompt = `
You are an expert Australian electricity bill parser. Extract the following details from the attached bill image(s).
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
  "billingDays": number,
  "quarterlyKwh": number,
  "dailyKwh": number,
  "quarterlyBillAmount": number,
  "solarExportKwh": number,
  "solarExportCredit": number,
  "tariffType": "string (e.g. Time of Use (TOU), Single Rate, Controlled Load, etc. Peak/Off-Peak implies TOU)",
  "meterType": "string (e.g. Smart Meter, Interval Meter, Basic Meter)"
}
`;

  let base64Images = [];
  
  if (mimeType === 'application/pdf') {
    // Convert PDF pages to PNG buffers
    const imageBuffers = await convertScannedPdfToImages(fileBuffer);
    // Limit to first 3 pages to save tokens and time
    for (let i = 0; i < Math.min(3, imageBuffers.length); i++) {
      base64Images.push(`data:image/png;base64,${imageBuffers[i].toString('base64')}`);
    }
  } else {
    // It's a regular image (jpg, png, etc.)
    base64Images.push(`data:${mimeType};base64,${fileBuffer.toString('base64')}`);
  }

  const contentArray = [
    { type: 'text', text: prompt }
  ];

  for (const b64 of base64Images) {
    contentArray.push({
      type: 'image_url',
      image_url: { url: b64, detail: 'high' }
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: contentArray }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  const responseText = response.choices[0].message.content;
  const parsed = JSON.parse(responseText.trim());
  
  // Validate and map to the format expected by the controller
  return {
    country: 'australia',
    confidence: 'high',
    isGemini: true, // keeping this flag name to minimize changes in other parts if they rely on it, basically means "is AI"
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
