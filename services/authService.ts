import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { callUpdateUserProfile } from './dataService';

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Sign in anonymously (for development and production)
 * Automatically creates a unique UID for each user
 */
export const signInAnonymously = async (): Promise<UserCredential> => {
  try {
    console.log('익명 인증 시도 중...');
    const result = await firebaseSignInAnonymously(auth);
    console.log('익명 인증 성공:', result.user.uid);
    return result;
  } catch (error: any) {
    console.error('익명 인증 실패:', error);
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('익명 인증이 활성화되지 않았습니다. Firebase Console에서 Anonymous Authentication을 활성화해주세요.');
    }
    throw error;
  }
};

/**
 * Create or update user profile with display name and nickname
 * This function should be called after anonymous sign-in
 */
export const createUserProfile = async (
  displayName: string,
  bio?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated. Please sign in first.');
  }

  try {
    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: displayName,
    });

    // Update Firestore user profile
    await callUpdateUserProfile({
      displayName: displayName,
      bio: bio || '',
    });
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
};

/**
 * Check if user has a profile in Firestore
 * Returns true if profile exists, false otherwise
 */
export const checkUserProfile = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('checkUserProfile: 사용자 없음');
    return false;
  }

  try {
    const { callGetUserProfile } = await import('./dataService');
    const result = await callGetUserProfile();
    console.log('checkUserProfile: 결과', {
      success: result.success,
      hasProfile: result.profile,
      displayName: result.profile?.displayName,
      displayNameLength: result.profile?.displayName?.length
    });
    
    // 프로필이 존재하고 displayName이 비어있지 않으면 true
    const hasProfile = result.success && result.profile && result.profile.displayName && result.profile.displayName.trim() !== '';
    console.log('checkUserProfile: 최종 결과', hasProfile);
    return hasProfile;
  } catch (error) {
    console.error('checkUserProfile: 실패', error);
    return false;
  }
};

