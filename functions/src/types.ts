import { Timestamp, FieldValue } from "firebase-admin/firestore";

/**
 * Firestore Document Types
 * These types represent the structure of documents stored in Firestore
 */

export type { Timestamp, FieldValue };

/**
 * User Document
 * Collection: users/{userId}
 */
export interface UserDocument {
  displayName: string;
  email: string;
  photoURL?: string;
  subscription: "free" | "pro" | "premium";
  bio?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  settings: {
    notifications: {
      weeklyReport: boolean;
      growthAlerts: boolean;
      marketingEmails: boolean;
    };
  };
}

/**
 * Analysis Document
 * Collection: analyses/{analysisId}
 */
export interface MetricDetail {
  score: number;
  reason: string;
  benchmark: string;
  keyElements: string[];
}

export interface Color {
  hex: string;
  rgb: string;
}

export interface DetectedObject {
  name: string;
  confidence: number;
}

export interface AnalysisDocument {
  userId: string;
  fileName: string;
  imageUrl: string;
  timestamp: Timestamp | FieldValue;
  summary: string;
  metrics: {
    layout: MetricDetail;
    typography: MetricDetail;
    color: MetricDetail;
    components: MetricDetail;
    formLanguage: MetricDetail;
    overall: number;
  };
  colors: Color[];
  keywords: string[];
  detectedObjects: DetectedObject[];
  suggestions: string;
}

/**
 * Chat Session Document
 * Collection: chatSessions/{sessionId}
 */
export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface ChatSessionDocument {
  userId: string;
  analysisId?: string;
  messages: ChatMessage[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * Bookmark Document
 * Collection: bookmarks/{bookmarkId}
 */
export interface BookmarkDocument {
  userId: string;
  referenceId: string;
  imageUrl: string;
  title: string;
  category: string;
  similarity: number;
  reason?: string;
  createdAt: Timestamp | FieldValue;
}

/**
 * Collection Document
 * Collection: collections/{collectionId}
 */
export interface CollectionDocument {
  userId: string;
  name: string;
  description?: string;
  analysisIds: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * Helper type for converting Firestore Timestamp to frontend format
 */
export interface AnalysisResult {
  id: string;
  fileName: string;
  timestamp: string;
  summary: string;
  metrics: {
    layout: MetricDetail;
    typography: MetricDetail;
    color: MetricDetail;
    components: MetricDetail;
    formLanguage: MetricDetail;
    overall: number;
  };
  colors: Color[];
  keywords: string[];
  detectedObjects: DetectedObject[];
  suggestions: string;
  imageUrl: string;
}

