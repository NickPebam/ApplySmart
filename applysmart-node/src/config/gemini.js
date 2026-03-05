import { GoogleGenerativeAI } from "@google/generative-ai";

let gemini = null;

export const getGemini = () => {
  if (!gemini) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env");
    }

    gemini = new GoogleGenerativeAI(apiKey);
  }

  return gemini;
};