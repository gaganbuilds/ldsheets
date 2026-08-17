import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfileDocument } from './users';

export const signUpWithEmail = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await createUserProfileDocument(user, 'email', { name });
    return user;
  } catch (error) {
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async (): Promise<User | void> => {
  try {
    const provider = new GoogleAuthProvider();
    // Use redirect on mobile to prevent "database is closing" IndexedDB issues with popups
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      await signInWithRedirect(auth, provider);
      // Wait indefinitely as the page will redirect
      return new Promise(() => {});
    } else {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await createUserProfileDocument(user, 'google');
      return user;
    }
  } catch (error) {
    throw error;
  }
};

export const checkGoogleRedirectResult = async (): Promise<void> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // Create user profile document if it doesn't exist
      await createUserProfileDocument(result.user, 'google');
    }
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};
