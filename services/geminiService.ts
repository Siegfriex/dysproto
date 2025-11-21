
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToGenerativePart(file);
    
    const metricProps = {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING, description: "Detailed reason for the score in Korean." },
          benchmark: { type: Type.STRING, description: "The specific design standard or criteria used (e.g., Material Design Grid, WCAG 2.1 AA) in Korean." },
          keyElements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of specific UI elements (e.g., Navbar, CTA Button) that influenced this score in Korean." 
          }
        },
        required: ["score", "reason", "benchmark", "keyElements"]
    };

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A comprehensive summary of the design in Korean (한국어)." },
        metrics: {
          type: Type.OBJECT,
          properties: {
            layout: metricProps,
            typography: metricProps,
            color: metricProps,
            components: metricProps,
            formLanguage: metricProps,
            overall: { type: Type.NUMBER, description: "Average or weighted overall score" },
          },
          required: ["layout", "typography", "color", "components", "formLanguage", "overall"]
        },
        colors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              rgb: { type: Type.STRING }
            }
          }
        },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        detectedObjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            }
          }
        },
        suggestions: { type: Type.STRING, description: "Actionable design suggestions in Korean (한국어)." }
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this design interface image. Act as a professional design critic (User Persona: Design Mentor). 
            
            1. Identify key objects (buttons, navbars, images, text blocks).
            2. Extract the main color palette.
            3. Provide 5-axis objective scores (0-100) and detailed reasoning specifically for:
               - Layout (Grid, Spacing)
               - Typography (Hierarchy, Readability)
               - Color (Harmony, Contrast)
               - Components (Consistency)
               - Form Language (Shape, Style)
               
            For each metric, you MUST provide:
            - A Score (0-100)
            - A Detailed Reason (Why?)
            - A Benchmark (What standard did you use? e.g., 8pt Grid System, Apple Human Interface Guidelines, WCAG, Gestalt Principles)
            - Key Elements (Which specific parts of the image led to this score?)

            4. Generate relevant design keywords.
            5. Provide a summary and actionable suggestions based on modern trends (e.g., Red Dot Award standards, Legacy Media standards).
            
            IMPORTANT: All textual explanations, summaries, reasons, benchmarks, and suggestions MUST be in Korean (한국어). Do NOT use emojis.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are 'dysproto', an AI design mentor. Your tone is objective, professional, yet encouraging. You help designers grow by providing data-driven feedback. Always respond in Korean (한국어). Do NOT use emojis in your response."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Sanitize JSON: remove markdown code blocks if present
    const sanitizedText = text.replace(/```json\n|\n```/g, "").trim();
    
    const parsed = JSON.parse(sanitizedText);

    return {
      fileName: file.name,
      timestamp: new Date().toLocaleString(),
      ...parsed
    };

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

export const chatWithDesignMentor = async (
  currentHistory: ChatMessage[],
  newMessage: string,
  context: AnalysisResult
): Promise<string> => {
  try {
    const contextString = `
      Current Design Context (File: ${context.fileName}):
      Summary: ${context.summary}
      Scores & Detailed Analysis: 
      - Layout: ${context.metrics.layout.score} 
        (Benchmark: ${context.metrics.layout.benchmark}, Key Elements: ${context.metrics.layout.keyElements.join(', ')})
        Reason: ${context.metrics.layout.reason}
      - Typography: ${context.metrics.typography.score}
        (Benchmark: ${context.metrics.typography.benchmark}, Key Elements: ${context.metrics.typography.keyElements.join(', ')})
        Reason: ${context.metrics.typography.reason}
      - Color: ${context.metrics.color.score}
        (Benchmark: ${context.metrics.color.benchmark}, Key Elements: ${context.metrics.color.keyElements.join(', ')})
        Reason: ${context.metrics.color.reason}
      - Components: ${context.metrics.components.score}
        (Benchmark: ${context.metrics.components.benchmark}, Key Elements: ${context.metrics.components.keyElements.join(', ')})
        Reason: ${context.metrics.components.reason}
      - Form Language: ${context.metrics.formLanguage.score}
        (Benchmark: ${context.metrics.formLanguage.benchmark}, Key Elements: ${context.metrics.formLanguage.keyElements.join(', ')})
        Reason: ${context.metrics.formLanguage.reason}
      
      Suggestions provided: ${context.suggestions}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are dysproto's AI Design Mentor. The user has uploaded a design. 
        Here is the analysis of that design: ${contextString}.
        Answer the user's questions specifically about this design. 
        Reference the metrics, benchmarks, and specific elements in your answers to sound authoritative.
        Suggest references or trends (Red Dot, etc.) if relevant.
        
        Format your response nicely with bullet points or sections if needed.
        IMPORTANT: You MUST answer in Korean (한국어). Do NOT use emojis.`
      },
      history: currentHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "응답을 생성할 수 없습니다.";

  } catch (error) {
    console.error("Chat failed", error);
    return "죄송합니다. 현재 디자인 멘토링 연결에 문제가 발생했습니다.";
  }
};
