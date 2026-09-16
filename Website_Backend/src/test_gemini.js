
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (e) {
    console.log(e);
  }
}
test();

