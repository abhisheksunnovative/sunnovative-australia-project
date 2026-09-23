import { GoogleGenerativeAI } from '@google/generative-ai';

export const runGeminiFallback = async (fileBuffer, mimeType, countryContext) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[GeminiFallback] No GEMINI_API_KEY found. Skipping fallback.");
            return null;
        }

        console.log(`[GeminiFallback] Initiating Gemini Vision API for ${countryContext} bill...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using flash for fast OCR fallback
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a precise data extraction AI. Extract the following fields from this electricity bill image.
Country context: ${countryContext}.
Return ONLY a valid JSON object with the exact keys:
- monthlyBill (number, the total amount due)
- retailer (string, name of the electricity company)
- fullName (string, customer name)
- consumerNumber (string, account or customer number)
- dueDate (string, DD/MM/YYYY)
- tariffCategory (string, tariff plan or category name)
- state (string, state abbreviation)
- quarterlyKwh or monthlyUnits (number, the total consumption units for the period)

Do NOT wrap in markdown \`\`\`json. Return raw JSON.`;

        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text().trim();
        if (responseText.startsWith("```json")) {
            responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        const jsonData = JSON.parse(responseText);
        console.log("[GeminiFallback] Successfully parsed data from Gemini.");
        return jsonData;
    } catch (err) {
        console.error("[GeminiFallback] Error during Gemini extraction:", err);
        return null;
    }
};
