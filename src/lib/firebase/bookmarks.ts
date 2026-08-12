import { collection, doc, getDocs, addDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { UserBookmark } from '@/types';

const COLLECTION_NAME = 'user_bookmarks';

export const getUserBookmarks = async (userId: string, problemIds?: string[]): Promise<UserBookmark[]> => {
  if (!userId) return [];
  
  const bookmarks: UserBookmark[] = [];
  
  if (problemIds && problemIds.length > 0) {
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
        bookmarks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserBookmark);
      });
    }
  } else {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      bookmarks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserBookmark);
    });
  }
  
  return bookmarks;
};

export const toggleProblemBookmark = async (
  userId: string, 
  problemId: string,
  existingBookmarkId?: string
): Promise<{ id: string | null, isBookmarked: boolean }> => {
  if (existingBookmarkId) {
    const docRef = doc(db, COLLECTION_NAME, existingBookmarkId);
    await deleteDoc(docRef);
    return { id: null, isBookmarked: false };
  }
  
  // Verify it doesn't already exist to be safe
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId),
    where('problemId', '==', problemId)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docRef = doc(db, COLLECTION_NAME, snapshot.docs[0].id);
    await deleteDoc(docRef);
    return { id: null, isBookmarked: false };
  }

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    problemId,
    createdAt: now,
    updatedAt: now,
  });
  
  return { id: docRef.id, isBookmarked: true };
};
