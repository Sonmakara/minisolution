
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

export interface GroundedDiagnosisResult extends DiagnosisResult {
  sources?: { uri: string; title: string }[];
}

export const getDiagnosticHelp = async (description: string, useWebSearch: boolean = false): Promise<GroundedDiagnosisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config: any = {
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
  };

  if (useWebSearch) {
    config.tools = [{ googleSearch: {} }];
    // Note: When using googleSearch, responseMimeType: "application/json" might sometimes conflict 
    // depending on the exact model version, but for Gemini 3 Pro it is generally supported.
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Troubleshoot the following IT issue: "${description}"`,
    config: config
  });

  const result = JSON.parse(response.text) as DiagnosisResult;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title
    }));

  return { ...result, sources };
};

export const getKnowledgeBaseArticle = async (query: string): Promise<{ text: string; sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Write a helpful IT guide for: ${query}. Use markdown formatting. Include common pitfalls.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title
    }));

  return { text: response.text, sources };
};
