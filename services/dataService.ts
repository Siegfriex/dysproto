import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from './firebase';
import type { AnalysisResult, ChatMessage, SearchResult } from '../types';

/**
 * Call analyzeDesign Function
 */
export const callAnalyzeDesign = async (
  imageData: string,
  mimeType: string,
  fileName: string
): Promise<{
  success: boolean;
  data: any;
  analysisId: string;
  imageUrl: string;
}> => {
  const analyzeDesign = httpsCallable<
    { imageData: string; mimeType: string; fileName: string },
    { success: boolean; data: any; analysisId: string; imageUrl: string }
  >(functions, 'analyzeDesign', { timeout: 300000 });

  const result = await analyzeDesign({ imageData, mimeType, fileName });
  return result.data;
};

/**
 * Call chatWithMentor Function
 */
export const callChatWithMentor = async (
  message: string,
  sessionId: string | null,
  analysisContext?: AnalysisResult
): Promise<{
  success: boolean;
  response: string;
  sessionId: string;
}> => {
  const chatWithMentor = httpsCallable<
    {
      message: string;
      sessionId: string | null;
      analysisContext?: AnalysisResult;
    },
    { success: boolean; response: string; sessionId: string }
  >(functions, 'chatWithMentor');

  const result = await chatWithMentor({
    message,
    sessionId,
    analysisContext,
  });
  return result.data;
};

/**
 * Call getAnalyses Function
 */
export const callGetAnalyses = async (
  limit: number = 20,
  startAfter?: string
): Promise<{
  success: boolean;
  analyses: AnalysisResult[];
  hasMore: boolean;
}> => {
  const getAnalyses = httpsCallable<
    { limit?: number; startAfter?: string },
    { success: boolean; analyses: AnalysisResult[]; hasMore: boolean }
  >(functions, 'getAnalyses');

  const result = await getAnalyses({ limit, startAfter });
  return result.data;
};

/**
 * Call getAnalysis Function
 */
export const callGetAnalysis = async (
  analysisId: string
): Promise<{
  success: boolean;
  analysis: AnalysisResult;
}> => {
  const getAnalysis = httpsCallable<
    { analysisId: string },
    { success: boolean; analysis: AnalysisResult }
  >(functions, 'getAnalysis');

  const result = await getAnalysis({ analysisId });
  return result.data;
};

/**
 * Call deleteAnalysis Function
 */
export const callDeleteAnalysis = async (
  analysisId: string
): Promise<{ success: boolean }> => {
  const deleteAnalysis = httpsCallable<
    { analysisId: string },
    { success: boolean }
  >(functions, 'deleteAnalysis');

  const result = await deleteAnalysis({ analysisId });
  return result.data;
};

/**
 * Call getUserProfile Function
 */
export const callGetUserProfile = async (): Promise<{
  success: boolean;
  profile: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    subscription: string;
    bio?: string;
    settings: {
      notifications: {
        weeklyReport: boolean;
        growthAlerts: boolean;
        marketingEmails: boolean;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}> => {
  const getUserProfile = httpsCallable<
    {},
    {
      success: boolean;
      profile: {
        id: string;
        displayName: string;
        email: string;
        photoURL?: string;
        subscription: string;
        bio?: string;
        settings: {
          notifications: {
            weeklyReport: boolean;
            growthAlerts: boolean;
            marketingEmails: boolean;
          };
        };
        createdAt: string;
        updatedAt: string;
      };
    }
  >(functions, 'getUserProfile');

  const result = await getUserProfile({});
  return result.data;
};

/**
 * Call updateUserProfile Function
 */
export const callUpdateUserProfile = async (updates: {
  displayName?: string;
  photoURL?: string;
  bio?: string;
}): Promise<{ success: boolean }> => {
  const updateUserProfile = httpsCallable<
    { displayName?: string; photoURL?: string; bio?: string },
    { success: boolean }
  >(functions, 'updateUserProfile');

  const result = await updateUserProfile(updates);
  return result.data;
};

/**
 * Call updateUserSettings Function
 */
export const callUpdateUserSettings = async (settings: {
  notifications: {
    weeklyReport: boolean;
    growthAlerts: boolean;
    marketingEmails: boolean;
  };
}): Promise<{ success: boolean }> => {
  const updateUserSettings = httpsCallable<
    {
      settings: {
        notifications: {
          weeklyReport: boolean;
          growthAlerts: boolean;
          marketingEmails: boolean;
        };
      };
    },
    { success: boolean }
  >(functions, 'updateUserSettings');

  const result = await updateUserSettings({ settings });
  return result.data;
};

/**
 * Call toggleBookmark Function
 */
export const callToggleBookmark = async (bookmarkData: {
  referenceId: string;
  imageUrl?: string;
  title?: string;
  category?: string;
  similarity?: number;
  reason?: string;
}): Promise<{ success: boolean; bookmarked: boolean }> => {
  const toggleBookmark = httpsCallable<
    {
      referenceId: string;
      imageUrl?: string;
      title?: string;
      category?: string;
      similarity?: number;
      reason?: string;
    },
    { success: boolean; bookmarked: boolean }
  >(functions, 'toggleBookmark');

  const result = await toggleBookmark(bookmarkData);
  return result.data;
};

/**
 * Call getBookmarks Function
 */
export const callGetBookmarks = async (): Promise<{
  success: boolean;
  bookmarks: Array<{
    id: string;
    referenceId: string;
    imageUrl: string;
    title: string;
    category: string;
    similarity: number;
    reason?: string;
    createdAt: string;
  }>;
}> => {
  const getBookmarks = httpsCallable<
    {},
    {
      success: boolean;
      bookmarks: Array<{
        id: string;
        referenceId: string;
        imageUrl: string;
        title: string;
        category: string;
        similarity: number;
        reason?: string;
        createdAt: string;
      }>;
    }
  >(functions, 'getBookmarks');

  const result = await getBookmarks({});
  return result.data;
};

/**
 * Call createCollection Function
 */
export const callCreateCollection = async (data: {
  name: string;
  description?: string;
}): Promise<{ success: boolean; collectionId: string }> => {
  const createCollection = httpsCallable<
    { name: string; description?: string },
    { success: boolean; collectionId: string }
  >(functions, 'createCollection');

  const result = await createCollection(data);
  return result.data;
};

/**
 * Call updateCollection Function
 */
export const callUpdateCollection = async (data: {
  collectionId: string;
  analysisId: string;
  action: 'add' | 'remove';
}): Promise<{ success: boolean }> => {
  const updateCollection = httpsCallable<
    { collectionId: string; analysisId: string; action: 'add' | 'remove' },
    { success: boolean }
  >(functions, 'updateCollection');

  const result = await updateCollection(data);
  return result.data;
};

/**
 * Call getCollections Function
 */
export const callGetCollections = async (): Promise<{
  success: boolean;
  collections: Array<{
    id: string;
    name: string;
    description?: string;
    analysisIds: string[];
    createdAt: string;
    updatedAt: string;
  }>;
}> => {
  const getCollections = httpsCallable<
    {},
    {
      success: boolean;
      collections: Array<{
        id: string;
        name: string;
        description?: string;
        analysisIds: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    }
  >(functions, 'getCollections');

  const result = await getCollections({});
  return result.data;
};

/**
 * Call searchImages Function
 */
export const callSearchImages = async (params: {
  query: string;
  num?: number;
  start?: number;
}): Promise<{
  success: boolean;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}> => {
  const searchImages = httpsCallable<
    { query: string; num?: number; start?: number },
    { success: boolean; results: SearchResult[]; totalResults: number; searchTime: number }
  >(functions, 'searchImages');

  const result = await searchImages(params);
  return result.data;
};
