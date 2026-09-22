import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Hi');
    console.log("Success with 1.5-pro:", result.response.text());
  } catch (err) {
    console.error("1.5-pro failed:", err.message);
  }
}
run();
