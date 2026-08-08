import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { Settings } from '@/types';

const SETTINGS_DOC_ID = 'global';
const COLLECTION_NAME = 'settings';

export const getSettings = async (): Promise<Settings> => {
  const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Settings;
  }
  // Default fallback if not initialized
  return {
    easyXP: 10,
    mediumXP: 25,
    hardXP: 50,
  };
};

export const updateSettings = async (settings: Settings): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
  await setDoc(docRef, settings, { merge: true });
};
