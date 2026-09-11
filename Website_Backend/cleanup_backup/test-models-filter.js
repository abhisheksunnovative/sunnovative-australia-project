import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const validModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    validModels.forEach(m => console.log(m.name));
  } catch(e) {
    console.error(e);
  }
}
listModels();
