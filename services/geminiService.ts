
import { AnalysisResult, ChatMessage } from "../types";
import { callAnalyzeDesign, callChatWithMentor } from "./dataService";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AnalysisProgress {
  stage: "preparing" | "uploading" | "analyzing" | "complete" | "error" | "retrying";
  progress: number;
  message: string;
}

export interface AnalyzeImageOptions {
  maxRetries?: number;
  onProgress?: (progress: AnalysisProgress) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  const retryableCodes = ["unavailable", "deadline-exceeded", "resource-exhausted"];
  return (
    retryableCodes.includes(error.code) ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("timeout")
  );
};

// ============================================================================
// Main Analysis Function
// ============================================================================

export const analyzeImage = async (
  file: File,
  options?: AnalyzeImageOptions
): Promise<AnalysisResult & { id?: string; imageUrl?: string }> => {
  const maxRetries = options?.maxRetries ?? 3;
  const onProgress = options?.onProgress;
  let lastError: Error | null = null;

  // File validation
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 지원합니다.");
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("파일 크기가 10MB를 초과합니다.");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "이미지를 준비하고 있습니다",
      });

      const base64Data = await fileToGenerativePart(file);

      onProgress?.({
        stage: "uploading",
        progress: 25,
        message: "이미지를 업로드하고 있습니다",
      });

      onProgress?.({
        stage: "analyzing",
        progress: 50,
        message: "AI가 디자인을 분석하고 있습니다",
      });

      const result = await callAnalyzeDesign(base64Data, file.type, file.name);

      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "분석이 완료되었습니다",
      });

      return {
        id: result.analysisId,
        fileName: file.name,
        timestamp: new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        imageUrl: result.imageUrl,
        ...result.data,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`Analysis attempt ${attempt}/${maxRetries} failed:`, error);

      if (!isRetryableError(error) || attempt === maxRetries) {
        onProgress?.({
          stage: "error",
          progress: 0,
          message: `분석 실패: ${error.message || "알 수 없는 오류"}`,
        });
        throw error;
      }

      const waitTime = Math.pow(2, attempt - 1) * 1000;
      onProgress?.({
        stage: "retrying",
        progress: 10 * attempt,
        message: `재시도 중 (${attempt}/${maxRetries})`,
      });
      await delay(waitTime);
    }
  }

  throw lastError || new Error("분석에 실패했습니다.");
};

export const chatWithDesignMentor = async (
  currentHistory: ChatMessage[],
  newMessage: string,
  context: AnalysisResult,
  sessionId: string | null = null
): Promise<{ response: string; sessionId: string }> => {
  try {
    // Call Firebase Function instead of direct API
    const result = await callChatWithMentor(newMessage, sessionId, context);
    return {
      response: result.response,
      sessionId: result.sessionId
    };

  } catch (error) {
    console.error("Chat failed", error);
    return {
      response: "죄송합니다. 현재 디자인 멘토링 연결에 문제가 발생했습니다.",
      sessionId: sessionId || ""
    };
  }
};
