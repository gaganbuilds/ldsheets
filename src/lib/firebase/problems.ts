import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from './config';
import { Problem } from '@/types';

const COLLECTION_NAME = 'problems';

export const getProblems = async (topicId?: string, roadmapId?: string): Promise<Problem[]> => {
  let q = collection(db, COLLECTION_NAME) as any;
  if (topicId) {
    q = query(q, where('topicId', '==', topicId));
  } else if (roadmapId) {
    q = query(q, where('roadmapId', '==', roadmapId));
  } else {
    q = query(q, orderBy('displayOrder', 'asc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as Problem[];
};

export const getProblem = async (id: string): Promise<Problem | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Problem;
  }
  return null;
};

export const createProblem = async (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...problem,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const bulkCreateProblems = async (problems: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ imported: number, failed: number }> => {
  let importedCount = 0;
  let failedCount = 0;
  try {
    const chunkSize = 400; // Safe batch size
    for (let i = 0; i < problems.length; i += chunkSize) {
      const chunk = problems.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      
      const now = Timestamp.now();
      chunk.forEach(problem => {
        const docRef = doc(collection(db, COLLECTION_NAME));
        batch.set(docRef, {
          ...problem,
          createdAt: now,
          updatedAt: now,
        });
      });
      
      await batch.commit();
      importedCount += chunk.length;
    }
    return { imported: importedCount, failed: failedCount };
  } catch (error) {
    console.error("Bulk create failed:", error);
    // Return what we successfully imported, and the remaining as failed
    failedCount = problems.length - importedCount;
    return { imported: importedCount, failed: failedCount };
  }
};

export const updateProblem = async (id: string, problem: Partial<Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...problem,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProblem = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
