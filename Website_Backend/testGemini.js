import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // We can't actually list models directly easily in all SDK versions, 
  // but let's try a quick request to gemini-1.5-flash-latest
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Hi');
    console.log("Success with 1.5-flash-latest:", result.response.text());
  } catch (err) {
    console.error("1.5-flash-latest failed:", err.message);
  }
}
run();
