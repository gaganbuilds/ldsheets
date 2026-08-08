import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProfile, AuthProvider } from '@/types';
import { User } from 'firebase/auth';

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const createUserProfileDocument = async (
  user: User,
  provider: AuthProvider,
  additionalData?: { name?: string }
): Promise<UserProfile> => {
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = new Date();

    const newUserProfile: UserProfile = {
      uid: user.uid,
      name: additionalData?.name || displayName || 'User',
      email: email || '',
      photoURL: photoURL,
      provider: provider,
      role: 'student',
      createdAt,
      updatedAt: createdAt,
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedProblems: 0,
      isAdmin: false,
    };

    try {
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    } catch (error) {
      console.error('Error creating user profile', error);
      throw error;
    }
  }

  return snapshot.data() as UserProfile;
};
