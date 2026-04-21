import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || ""; // Loaded from environment
const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    // The SDK might not expose a direct listModels if it's stripped down, but let's try calling the REST API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => {
        if (m.name.includes('gemini')) {
            console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(', ')})`);
        }
    });
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

checkModels();
