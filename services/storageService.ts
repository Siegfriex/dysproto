import { storage } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Firebase Storage에서 이미지 다운로드 URL을 가져옵니다.
 * Storage Rules에 따라 인증된 사용자만 자신의 파일에 접근할 수 있습니다.
 * 
 * @param filePath - Storage 내 파일 경로 (예: "users/{userId}/analyses/{filename}")
 * @returns 다운로드 URL
 */
export const getImageDownloadUrl = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error;
  }
};

/**
 * Storage URL에서 파일 경로를 추출합니다.
 * 
 * @param storageUrl - Storage URL (예: "https://storage.googleapis.com/bucket/path")
 * @returns 파일 경로 (예: "users/{userId}/analyses/{filename}")
 */
export const extractFilePathFromUrl = (storageUrl: string): string | null => {
  try {
    // https://storage.googleapis.com/{bucket}/users/{userId}/analyses/{filename}
    const match = storageUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Failed to extract file path from URL:', error);
    return null;
  }
};

