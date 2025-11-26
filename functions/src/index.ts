import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { GoogleGenAI } from "@google/genai";
import type {
  AnalysisDocument,
  ChatSessionDocument,
  ChatMessage,
  UserDocument,
  BookmarkDocument,
  CollectionDocument,
} from "./types";

admin.initializeApp();

// Initialize Firestore
const db = getFirestore();

// Initialize Storage
const bucket = getStorage().bucket();

// Secret Manager에서 환경 변수로 주입된 시크릿 사용
// 주의: Firebase Functions v2에서는 Secret Manager의 Secret을 환경 변수로 매핑하려면
// Firebase Console에서 각 함수의 Configuration 탭에서 수동으로 설정해야 합니다.
// Google Custom Search Engine ID (환경 변수 또는 기본값)
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || "665cb462ec68043bc";

/**
 * Helper function to get user ID from Firebase Authentication
 * 
 * Supports anonymous authentication for both development and production environments.
 * Anonymous authentication provides a unique UID for each user without requiring
 * email/password, making it ideal for user testing and quick onboarding.
 * 
 * @param request - Firebase Functions request object containing auth information
 * @returns User ID (UID) from Firebase Authentication
 * @throws HttpsError if user is not authenticated (in production)
 * 
 * @example
 * ```typescript
 * const userId = getUserId(request);
 * // userId will be the Firebase Auth UID (e.g., "abc123...")
 * ```
 */
function getUserId(request: any): string {
  const userId = request.auth?.uid;
  
  if (!userId) {
    // Development environment: allow anonymous fallback
    // Production: require authentication (anonymous auth counts as authenticated)
    if (process.env.NODE_ENV === 'development' || process.env.FUNCTIONS_EMULATOR) {
      console.warn('No authenticated user found, using anonymous fallback (development only)');
      return "anonymous";
    }
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated. Please sign in."
    );
  }
  
  return userId;
}

/**
 * Upload image to Firebase Storage and return signed URL
 */
async function uploadImageToStorage(
  userId: string,
  imageData: string,
  mimeType: string,
  fileName: string
): Promise<string> {
  try {
    const buffer = Buffer.from(imageData, "base64");
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `users/${userId}/analyses/${timestamp}_${sanitizedFileName}`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Return public URL (accessible via Storage Rules)
    // Storage Rules에서 인증된 사용자가 자신의 파일을 읽을 수 있도록 설정됨
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error("Storage upload failed:", error);
    throw new HttpsError(
      "internal",
      "Failed to upload image to storage"
    );
  }
}

/**
 * 디자인 이미지 분석 Cloud Function
 * 클라이언트로부터 이미지를 받아 Gemini API로 분석하고 Firestore에 저장합니다
 */
export const analyzeDesign = onCall(
  { 
    region: "asia-northeast3", 
    timeoutSeconds: 300, 
    memory: "512MiB"
  },
  async (request) => {
    // Get user ID (optional authentication)
    const userId = getUserId(request);

    const data = request.data;
    
    // Secret Manager에서 환경 변수로 주입된 API 키 사용
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new HttpsError(
        "failed-precondition",
        "Gemini API is not configured"
      );
    }
    
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const { imageData, mimeType, fileName } = data;

    if (!imageData || !mimeType) {
      throw new HttpsError(
        "invalid-argument",
        "Missing imageData or mimeType"
      );
    }

    const sanitizedFileName = fileName || `image_${Date.now()}`;

    try {
      // 1. Upload image to Storage
      const imageUrl = await uploadImageToStorage(
        userId,
        imageData,
        mimeType,
        sanitizedFileName
      );

      // 2. Perform AI analysis
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

      // 3. Save analysis result to Firestore
      const analysisData: Omit<AnalysisDocument, "timestamp"> & {
        timestamp: FieldValue;
      } = {
        userId,
        fileName: sanitizedFileName,
        imageUrl,
        timestamp: FieldValue.serverTimestamp(),
        summary: parsed.summary,
        metrics: parsed.metrics,
        colors: parsed.colors || [],
        keywords: parsed.keywords || [],
        detectedObjects: parsed.detectedObjects || [],
        suggestions: parsed.suggestions || "",
      };

      const docRef = await db.collection("analyses").add(analysisData);

      return {
        success: true,
        data: parsed,
        analysisId: docRef.id,
        imageUrl,
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
 * 채팅 세션을 Firestore에 저장합니다
 */
export const chatWithMentor = onCall(
  { 
    region: "asia-northeast3"
  },
  async (request) => {
    // Get user ID (optional authentication)
    const userId = getUserId(request);

    const data = request.data;
    
    // Secret Manager에서 환경 변수로 주입된 API 키 사용
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new HttpsError(
        "failed-precondition",
        "Gemini API is not configured"
      );
    }
    
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const { message, sessionId, analysisContext } = data;

    if (!message) {
      throw new HttpsError(
        "invalid-argument",
        "Missing message"
      );
    }

    try {
      // Get or create chat session
      let currentSessionId = sessionId;
      let existingMessages: ChatMessage[] = [];

      if (currentSessionId) {
        // Load existing session
        const sessionDoc = await db
          .collection("chatSessions")
          .doc(currentSessionId)
          .get();

        if (sessionDoc.exists) {
          const sessionData = sessionDoc.data() as ChatSessionDocument;
          if (sessionData.userId !== userId) {
            throw new HttpsError(
              "permission-denied",
              "Not authorized to access this session"
            );
          }
          existingMessages = sessionData.messages || [];
        } else {
          // Session not found, create new one
          currentSessionId = null;
        }
      }

      if (!currentSessionId) {
        // Create new session
        const newSessionData: Omit<ChatSessionDocument, "createdAt" | "updatedAt"> & {
          createdAt: FieldValue;
          updatedAt: FieldValue;
        } = {
          userId,
          analysisId: analysisContext?.id || null,
          messages: [],
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        const sessionRef = await db
          .collection("chatSessions")
          .add(newSessionData);
        currentSessionId = sessionRef.id;
      }

      // Prepare context string
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

      // Convert existing messages to Gemini format
      const history = existingMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // Create chat instance
      const chat = ai.chats.create({
        model: "gemini-3-pro-preview",
        config: {
          systemInstruction: `You are dysproto's AI Design Mentor. ${contextString}
          Answer the user's questions about design.
          IMPORTANT: You MUST answer in Korean (한국어).`,
        },
        history,
      });

      // Get AI response
      const result = await chat.sendMessage({ message });
      const aiResponse = result.text || "응답을 생성할 수 없습니다.";

      // Add new messages to session
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: message,
        timestamp: Date.now(),
      };

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: aiResponse,
        timestamp: Date.now(),
      };

      const updatedMessages = [...existingMessages, userMessage, botMessage];

      // Update session in Firestore
      await db.collection("chatSessions").doc(currentSessionId).update({
        messages: updatedMessages,
        updatedAt: FieldValue.serverTimestamp(),
        ...(analysisContext?.fileName && {
          analysisId: analysisContext.fileName,
        }),
      });

      return {
        success: true,
        response: aiResponse,
        sessionId: currentSessionId,
      };
    } catch (error) {
      console.error("Chat failed:", error);
      throw new HttpsError(
        "internal",
        "Failed to process chat"
      );
    }
  });

/**
 * 분석 결과 조회 Functions
 */

/**
 * 사용자의 모든 분석 결과 조회
 */
export const getAnalyses = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { limit = 20, startAfter } = request.data;

    try {
      let query = db
        .collection("analyses")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit);

      if (startAfter) {
        const startAfterDoc = await db
          .collection("analyses")
          .doc(startAfter)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const analyses = snapshot.docs.map((doc) => {
        const data = doc.data() as AnalysisDocument;
        return {
          id: doc.id,
          fileName: data.fileName,
          timestamp: data.timestamp instanceof admin.firestore.Timestamp
            ? data.timestamp.toDate().toLocaleString()
            : new Date().toLocaleString(),
          summary: data.summary,
          metrics: data.metrics,
          colors: data.colors,
          keywords: data.keywords,
          detectedObjects: data.detectedObjects,
          suggestions: data.suggestions,
          imageUrl: data.imageUrl,
        };
      });

      return {
        success: true,
        analyses,
        hasMore: snapshot.docs.length === limit,
      };
    } catch (error) {
      console.error("Failed to get analyses:", error);
      throw new HttpsError(
        "internal",
        "Failed to retrieve analyses"
      );
    }
  }
);

/**
 * 특정 분석 결과 조회
 */
export const getAnalysis = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { analysisId } = request.data;

    if (!analysisId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing analysisId"
      );
    }

    try {
      const doc = await db.collection("analyses").doc(analysisId).get();

      if (!doc.exists) {
        throw new HttpsError("not-found", "Analysis not found");
      }

      const data = doc.data() as AnalysisDocument;

      if (data.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "Not authorized to access this analysis"
        );
      }

      return {
        success: true,
        analysis: {
          id: doc.id,
          fileName: data.fileName,
          timestamp: data.timestamp instanceof admin.firestore.Timestamp
            ? data.timestamp.toDate().toLocaleString()
            : new Date().toLocaleString(),
          summary: data.summary,
          metrics: data.metrics,
          colors: data.colors,
          keywords: data.keywords,
          detectedObjects: data.detectedObjects,
          suggestions: data.suggestions,
          imageUrl: data.imageUrl,
        },
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Failed to get analysis:", error);
      throw new HttpsError(
        "internal",
        "Failed to retrieve analysis"
      );
    }
  }
);

/**
 * 분석 결과 삭제
 */
export const deleteAnalysis = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { analysisId } = request.data;

    if (!analysisId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing analysisId"
      );
    }

    try {
      const doc = await db.collection("analyses").doc(analysisId).get();

      if (!doc.exists) {
        throw new HttpsError("not-found", "Analysis not found");
      }

      const data = doc.data() as AnalysisDocument;

      if (data.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "Not authorized to delete this analysis"
        );
      }

      // Delete the document
      await db.collection("analyses").doc(analysisId).delete();

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Failed to delete analysis:", error);
      throw new HttpsError(
        "internal",
        "Failed to delete analysis"
      );
    }
  }
);

/**
 * 사용자 프로필 Functions
 */

/**
 * 사용자 프로필 조회
 */
export const getUserProfile = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);

    try {
      const doc = await db.collection("users").doc(userId).get();

      if (!doc.exists) {
        // Create default profile
        // For anonymous users, displayName will be empty and should be set via updateUserProfile
        // For email/password users, use email as default displayName if available
        const authEmail = request.auth?.token.email || "";
        const defaultDisplayName = authEmail 
          ? authEmail.split("@")[0] // Use email username as default displayName
          : ""; // Anonymous users should set displayName via onboarding
        
        const defaultProfile: Omit<UserDocument, "createdAt" | "updatedAt"> & {
          createdAt: FieldValue;
          updatedAt: FieldValue;
        } = {
          displayName: defaultDisplayName,
          email: authEmail,
          subscription: "free",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          settings: {
            notifications: {
              weeklyReport: true,
              growthAlerts: true,
              marketingEmails: false,
            },
          },
        };

        await db.collection("users").doc(userId).set(defaultProfile);

        return {
          success: true,
          profile: {
            id: userId,
            ...defaultProfile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      }

      const data = doc.data() as UserDocument;
      return {
        success: true,
        profile: {
          id: doc.id,
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL,
          subscription: data.subscription,
          bio: data.bio,
          settings: data.settings,
          createdAt: data.createdAt instanceof admin.firestore.Timestamp
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          updatedAt: data.updatedAt instanceof admin.firestore.Timestamp
            ? data.updatedAt.toDate().toISOString()
            : new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw new HttpsError(
        "internal",
        "Failed to retrieve user profile"
      );
    }
  }
);

/**
 * 사용자 프로필 업데이트
 */
export const updateUserProfile = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { displayName, photoURL, bio } = request.data;

    try {
      const updates: Partial<UserDocument> = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (displayName !== undefined) {
        updates.displayName = displayName;
      }
      if (photoURL !== undefined) {
        updates.photoURL = photoURL;
      }
      if (bio !== undefined) {
        updates.bio = bio;
      }

      await db.collection("users").doc(userId).update(updates);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw new HttpsError(
        "internal",
        "Failed to update user profile"
      );
    }
  }
);

/**
 * 사용자 설정 업데이트
 */
export const updateUserSettings = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { settings } = request.data;

    if (!settings) {
      throw new HttpsError(
        "invalid-argument",
        "Missing settings"
      );
    }

    try {
      await db.collection("users").doc(userId).update({
        settings,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update user settings:", error);
      throw new HttpsError(
        "internal",
        "Failed to update user settings"
      );
    }
  }
);

/**
 * 북마크 Functions
 */

/**
 * 북마크 추가/제거 토글
 */
export const toggleBookmark = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { referenceId, imageUrl, title, category, similarity, reason } =
      request.data;

    if (!referenceId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing referenceId"
      );
    }

    try {
      // Check if bookmark already exists
      const existingSnapshot = await db
        .collection("bookmarks")
        .where("userId", "==", userId)
        .where("referenceId", "==", referenceId)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        // Delete existing bookmark
        await existingSnapshot.docs[0].ref.delete();
        return {
          success: true,
          bookmarked: false,
        };
      } else {
        // Create new bookmark
        const bookmarkData: Omit<BookmarkDocument, "createdAt"> & {
          createdAt: FieldValue;
        } = {
          userId,
          referenceId,
          imageUrl: imageUrl || "",
          title: title || "",
          category: category || "",
          similarity: similarity || 0,
          reason: reason,
          createdAt: FieldValue.serverTimestamp(),
        };

        await db.collection("bookmarks").add(bookmarkData);
        return {
          success: true,
          bookmarked: true,
        };
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      throw new HttpsError(
        "internal",
        "Failed to toggle bookmark"
      );
    }
  }
);

/**
 * 사용자의 모든 북마크 조회
 */
export const getBookmarks = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);

    try {
      const snapshot = await db
        .collection("bookmarks")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const bookmarks = snapshot.docs.map((doc) => {
        const data = doc.data() as BookmarkDocument;
        return {
          id: doc.id,
          referenceId: data.referenceId,
          imageUrl: data.imageUrl,
          title: data.title,
          category: data.category,
          similarity: data.similarity,
          reason: data.reason,
          createdAt: data.createdAt instanceof admin.firestore.Timestamp
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        };
      });

      return {
        success: true,
        bookmarks,
      };
    } catch (error) {
      console.error("Failed to get bookmarks:", error);
      throw new HttpsError(
        "internal",
        "Failed to retrieve bookmarks"
      );
    }
  }
);

/**
 * 컬렉션 Functions
 */

/**
 * 컬렉션 생성
 */
export const createCollection = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { name, description } = request.data;

    if (!name) {
      throw new HttpsError(
        "invalid-argument",
        "Missing collection name"
      );
    }

    try {
      const collectionData: Omit<CollectionDocument, "createdAt" | "updatedAt"> & {
        createdAt: FieldValue;
        updatedAt: FieldValue;
      } = {
        userId,
        name,
        description: description || "",
        analysisIds: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection("collections").add(collectionData);

      return {
        success: true,
        collectionId: docRef.id,
      };
    } catch (error) {
      console.error("Failed to create collection:", error);
      throw new HttpsError(
        "internal",
        "Failed to create collection"
      );
    }
  }
);

/**
 * 컬렉션 업데이트 (분석 추가/제거)
 */
export const updateCollection = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);
    const { collectionId, analysisId, action } = request.data;

    if (!collectionId || !analysisId || !action) {
      throw new HttpsError(
        "invalid-argument",
        "Missing collectionId, analysisId, or action"
      );
    }

    if (action !== "add" && action !== "remove") {
      throw new HttpsError(
        "invalid-argument",
        "Action must be 'add' or 'remove'"
      );
    }

    try {
      const doc = await db.collection("collections").doc(collectionId).get();

      if (!doc.exists) {
        throw new HttpsError("not-found", "Collection not found");
      }

      const data = doc.data() as CollectionDocument;

      if (data.userId !== userId) {
        throw new HttpsError(
          "permission-denied",
          "Not authorized to update this collection"
        );
      }

      const currentIds = data.analysisIds || [];
      const newIds =
        action === "add"
          ? [...currentIds, analysisId]
          : currentIds.filter((id) => id !== analysisId);

      await doc.ref.update({
        analysisIds: newIds,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Failed to update collection:", error);
      throw new HttpsError(
        "internal",
        "Failed to update collection"
      );
    }
  }
);

/**
 * 사용자의 모든 컬렉션 조회
 */
export const getCollections = onCall(
  { region: "asia-northeast3" },
  async (request) => {
    const userId = getUserId(request);

    try {
      const snapshot = await db
        .collection("collections")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const collections = snapshot.docs.map((doc) => {
        const data = doc.data() as CollectionDocument;
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          analysisIds: data.analysisIds,
          createdAt: data.createdAt instanceof admin.firestore.Timestamp
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          updatedAt: data.updatedAt instanceof admin.firestore.Timestamp
            ? data.updatedAt.toDate().toISOString()
            : new Date().toISOString(),
        };
      });

      return {
        success: true,
        collections,
      };
    } catch (error) {
      console.error("Failed to get collections:", error);
      throw new HttpsError(
        "internal",
        "Failed to retrieve collections"
      );
    }
  }
);

/**
 * Google Custom Search Image API를 사용하여 이미지 검색
 */
export const searchImages = onCall(
  { 
    region: "asia-northeast3"
  },
  async (request) => {
    const { query, num = 10, start = 1 } = request.data;

    if (!query) {
      throw new HttpsError(
        "invalid-argument",
        "Missing search query"
      );
    }

    // Secret Manager에서 환경 변수로 주입된 API 키 사용
    const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    if (!GOOGLE_SEARCH_API_KEY) {
      throw new HttpsError(
        "failed-precondition",
        "Google Custom Search API is not configured"
      );
    }

    try {
      // Google Custom Search API 호출
      const apiUrl = "https://www.googleapis.com/customsearch/v1";
      const params = new URLSearchParams({
        key: GOOGLE_SEARCH_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        searchType: "image",
        num: Math.min(num, 10).toString(), // 최대 10개
        start: start.toString(),
        safe: "active", // 안전 검색 활성화
        imgSize: "large", // 큰 이미지만
        imgType: "photo", // 사진 타입
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new HttpsError(
          "internal",
          `Google Search API error: ${errorData?.error?.message || response.statusText}`
        );
      }

      const data = (await response.json()) as any;

      // 결과를 SearchResult 형식으로 변환
      const categories = ['Web Design', 'Mobile UI', 'Branding', 'Print', 'Typography', 'Art Direction', '3D'];
      
      const results = (data.items || []).map((item: any, index: number) => {
        // 카테고리 매핑
        const categoryIndex = index % categories.length;
        
        return {
          id: `search-${start + index - 1}`,
          imageUrl: item.link || item.image?.contextLink || "",
          title: item.title || item.displayLink || "Untitled",
          similarity: Math.floor(Math.random() * 15) + 80, // 실제로는 AI로 계산 가능
          category: categories[categoryIndex],
          reason: `검색 결과: ${query}`,
          awards: undefined,
          isSaved: false,
        };
      });

      return {
        success: true,
        results: results,
        totalResults: parseInt(data.searchInformation?.totalResults || "0"),
        searchTime: parseFloat(data.searchInformation?.searchTime || "0"),
      };
    } catch (error) {
      console.error("Image search failed:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError(
        "internal",
        "Failed to search images"
      );
    }
  }
);
