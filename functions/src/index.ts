import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();

// Gemini API 키는 Firebase Functions 환경 변수에서 가져옵니다
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * 디자인 이미지 분석 Cloud Function
 * 클라이언트로부터 이미지를 받아 Gemini API로 분석합니다
 */
export const analyzeDesign = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const data = request.data;
    if (!ai) {
      throw new HttpsError(
        "failed-precondition",
        "Gemini API is not configured"
      );
    }

    const { imageData, mimeType } = data;

    if (!imageData || !mimeType) {
      throw new HttpsError(
        "invalid-argument",
        "Missing imageData or mimeType"
      );
    }

    try {
      const metricProps = {
        type: "object" as const,
        properties: {
          score: { type: "number" as const },
          reason: {
            type: "string" as const,
            description: "Detailed reason for the score in Korean.",
          },
          benchmark: {
            type: "string" as const,
            description:
              "The specific design standard or criteria used in Korean.",
          },
          keyElements: {
            type: "array" as const,
            items: { type: "string" as const },
            description:
              "List of specific UI elements that influenced this score in Korean.",
          },
        },
        required: ["score", "reason", "benchmark", "keyElements"],
      };

      const schema = {
        type: "object" as const,
        properties: {
          summary: {
            type: "string" as const,
            description: "A comprehensive summary of the design in Korean.",
          },
          metrics: {
            type: "object" as const,
            properties: {
              layout: metricProps,
              typography: metricProps,
              color: metricProps,
              components: metricProps,
              formLanguage: metricProps,
              overall: {
                type: "number" as const,
                description: "Average or weighted overall score",
              },
            },
            required: [
              "layout",
              "typography",
              "color",
              "components",
              "formLanguage",
              "overall",
            ],
          },
          colors: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                hex: { type: "string" as const },
                rgb: { type: "string" as const },
              },
            },
          },
          keywords: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          detectedObjects: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                confidence: { type: "number" as const },
              },
            },
          },
          suggestions: {
            type: "string" as const,
            description: "Actionable design suggestions in Korean.",
          },
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageData,
              },
            },
            {
              text: `Analyze this design interface image. Act as a professional design critic.

            1. Identify key objects (buttons, navbars, images, text blocks).
            2. Extract the main color palette.
            3. Provide 5-axis objective scores (0-100) and detailed reasoning for:
               - Layout (Grid, Spacing)
               - Typography (Hierarchy, Readability)
               - Color (Harmony, Contrast)
               - Components (Consistency)
               - Form Language (Shape, Style)

            For each metric, provide:
            - A Score (0-100)
            - A Detailed Reason (Why?)
            - A Benchmark (What standard did you use?)
            - Key Elements (Which specific parts influenced this score?)

            4. Generate relevant design keywords.
            5. Provide a summary and actionable suggestions.

            IMPORTANT: All textual explanations MUST be in Korean (한국어).`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction:
            "You are 'dysproto', an AI design mentor. Respond in Korean (한국어).",
        },
      });

      const text = response.text;
      if (!text) {
        throw new HttpsError(
          "internal",
          "No response from AI"
        );
      }

      const sanitizedText = text.replace(/```json\n|\n```/g, "").trim();
      const parsed = JSON.parse(sanitizedText);

      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      console.error("Analysis failed:", error);
      throw new HttpsError(
        "internal",
        "Failed to analyze design"
      );
    }
  });

/**
 * 디자인 멘토 챗봇 Cloud Function
 */
export const chatWithMentor = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const data = request.data;
    if (!ai) {
      throw new HttpsError(
        "failed-precondition",
        "Gemini API is not configured"
      );
    }

    const { message, history, analysisContext } = data;

    if (!message) {
      throw new HttpsError(
        "invalid-argument",
        "Missing message"
      );
    }

    try {
      const contextString = analysisContext
        ? `
      Current Design Context (File: ${analysisContext.fileName}):
      Summary: ${analysisContext.summary}
      Scores: Layout ${analysisContext.metrics.layout.score},
              Typography ${analysisContext.metrics.typography.score},
              Color ${analysisContext.metrics.color.score},
              Components ${analysisContext.metrics.components.score},
              Form Language ${analysisContext.metrics.formLanguage.score}
      `
        : "";

      const chat = ai.chats.create({
        model: "gemini-3-pro-preview",
        config: {
          systemInstruction: `You are dysproto's AI Design Mentor. ${contextString}
          Answer the user's questions about design.
          IMPORTANT: You MUST answer in Korean (한국어).`,
        },
        history:
          history?.map((msg: { role: string; text: string }) => ({
            role: msg.role,
            parts: [{ text: msg.text }],
          })) || [],
      });

      const result = await chat.sendMessage({ message });
      return {
        success: true,
        response: result.text || "응답을 생성할 수 없습니다.",
      };
    } catch (error) {
      console.error("Chat failed:", error);
      throw new HttpsError(
        "internal",
        "Failed to process chat"
      );
    }
  });
