import { collection, doc, getDocs, addDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { UserNote } from '@/types';

const COLLECTION_NAME = 'user_notes';

export const getProblemNotes = async (userId: string, problemIds: string[]): Promise<UserNote[]> => {
  if (!userId || !problemIds || problemIds.length === 0) return [];
  
  // Firestore 'in' query has a limit of 10 items.
  // For a full topic, we might have more than 10 problems.
  // Instead, we fetch all notes for the user, or we chunk the problemIds.
  // To keep it lightweight and scalable without needing an extra index on topicId,
  // we'll fetch all notes for the user for these specific problems by chunking.
  
  const notes: UserNote[] = [];
  const chunkSize = 10;
  
  for (let i = 0; i < problemIds.length; i += chunkSize) {
    const chunk = problemIds.slice(i, i + chunkSize);
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      where('problemId', 'in', chunk)
    );
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserNote);
    });
  }
  
  return notes;
};

export const saveProblemNote = async (
  userId: string, 
  problemId: string, 
  content: string,
  existingNoteId?: string
): Promise<string> => {
  const now = Timestamp.now();
  
  if (existingNoteId) {
    const docRef = doc(db, COLLECTION_NAME, existingNoteId);
    await updateDoc(docRef, {
      content,
      updatedAt: now,
    });
    return existingNoteId;
  }
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    problemId,
    content,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};
