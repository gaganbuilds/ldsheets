import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  runTransaction,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { UserProfile } from '@/types';

const USERS_COLLECTION = 'users';
const USERNAMES_COLLECTION = 'usernames';
const PUBLIC_PROFILES_COLLECTION = 'public_profiles';

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  if (!username) return false;
  // Username requirements: lowercase, alphanumeric/underscore, no spaces
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error('Invalid username format');
  }

  const usernameRef = doc(db, USERNAMES_COLLECTION, username);
  const snap = await getDoc(usernameRef);
  return !snap.exists();
};

export const updateProfile = async (
  userId: string, 
  updates: Partial<UserProfile>, 
  oldUsername?: string
): Promise<void> => {
  
  const userRef = doc(db, USERS_COLLECTION, userId);
  const publicRef = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  const newUsername = updates.username;

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) return;
    
    // If username is changing, we need to handle the unique usernames collection safely
    if (newUsername && newUsername !== oldUsername) {
      if (!/^[a-z0-9_]{3,20}$/.test(newUsername)) {
        throw new Error('Invalid username format');
      }
      
      const newUsernameRef = doc(db, USERNAMES_COLLECTION, newUsername);
      const newUsernameSnap = await transaction.get(newUsernameRef);
      
      if (newUsernameSnap.exists()) {
        throw new Error('Username is already taken');
      }
      
      transaction.set(newUsernameRef, { uid: userId });
      
      if (oldUsername) {
        const oldUsernameRef = doc(db, USERNAMES_COLLECTION, oldUsername);
        transaction.delete(oldUsernameRef);
      }
    }

    transaction.update(userRef, updates);
    
    // Sync public profile
    const currentData = userSnap.data() as UserProfile;
    const mergedData = { ...currentData, ...updates };
    
    if (mergedData.isPublicProfile) {
      transaction.set(publicRef, {
        uid: mergedData.uid || userId,
        username: mergedData.username || '',
        name: mergedData.name || '',
        photoURL: mergedData.photoURL || null,
        bio: mergedData.bio || '',
        totalXP: mergedData.totalXP || 0,
        level: mergedData.level || 1,
        completedProblems: mergedData.completedProblems || 0,
        currentStreak: mergedData.currentStreak || 0,
        longestStreak: mergedData.longestStreak || 0,
        isPublicProfile: true,
        updatedAt: mergedData.updatedAt || new Date()
      });
    } else {
      transaction.delete(publicRef);
    }
  });
};

export const removeProfilePhoto = async (userId: string): Promise<void> => {
  await updateProfile(userId, { photoURL: null });
};

export const getPublicProfile = async (username: string): Promise<UserProfile | null> => {
  const usernameRef = doc(db, USERNAMES_COLLECTION, username);
  const usernameSnap = await getDoc(usernameRef);
  
  if (!usernameSnap.exists()) {
    return null;
  }
  
  const uid = usernameSnap.data().uid;
  const publicRef = doc(db, PUBLIC_PROFILES_COLLECTION, uid);
  const publicSnap = await getDoc(publicRef);
  
  if (!publicSnap.exists()) {
    return null;
  }
  
  const profile = publicSnap.data() as UserProfile;
  return profile;
};

export const ensurePublicProfileSync = async (userProfile: UserProfile): Promise<void> => {
  if (!userProfile.isPublicProfile) return;
  
  const publicRef = doc(db, PUBLIC_PROFILES_COLLECTION, userProfile.uid);
  const publicSnap = await getDoc(publicRef);
  
  if (!publicSnap.exists()) {
    // Requires sync
    const { setDoc } = await import('firebase/firestore');
    await setDoc(publicRef, {
      uid: userProfile.uid,
      username: userProfile.username || '',
      name: userProfile.name || '',
      photoURL: userProfile.photoURL || null,
      bio: userProfile.bio || '',
      totalXP: userProfile.totalXP || 0,
      level: userProfile.level || 1,
      completedProblems: userProfile.completedProblems || 0,
      currentStreak: userProfile.currentStreak || 0,
      longestStreak: userProfile.longestStreak || 0,
      isPublicProfile: true,
      updatedAt: userProfile.updatedAt || new Date()
    });
  }
};
