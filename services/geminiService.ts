
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

// Fix: Instantiating GoogleGenAI inside functions to ensure fresh process.env.API_KEY and using gemini-3-pro-preview for diagnostic tasks

export const getDiagnosticHelp = async (description: string): Promise<DiagnosisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Troubleshoot the following IT issue: "${description}"`,
    config: {
      systemInstruction: "You are a senior IT troubleshooting assistant. Provide a structured diagnosis in JSON format.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step instructions to fix the issue."
          },
          possibleCauses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Potential root causes."
          },
          estimatedDifficulty: {
            type: Type.STRING,
            enum: ["Easy", "Medium", "Hard"]
          }
        },
        required: ["steps", "possibleCauses", "estimatedDifficulty"]
      }
    }
  });

  return JSON.parse(response.text) as DiagnosisResult;
};

export const getKnowledgeBaseArticle = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Write a helpful IT guide for: ${query}. Use markdown formatting. Include common pitfalls.`,
  });
  return response.text;
};
