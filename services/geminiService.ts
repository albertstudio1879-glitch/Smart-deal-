import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const generateSalesPitch = async (productName: string, category: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Unable to generate AI review.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Write a short, catchy, and persuasive 2-sentence sales pitch for a product named "${productName}" in the "${category}" category. Focus on why a customer needs it now. Use emojis.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Check out this amazing product!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Discover why this product is a must-have!";
  }
};