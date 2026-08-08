import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { Roadmap } from '@/types';

const COLLECTION_NAME = 'roadmaps';

export const getRoadmaps = async (): Promise<Roadmap[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('displayOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Roadmap[];
};

export const getRoadmap = async (id: string): Promise<Roadmap | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Roadmap;
  }
  return null;
};

export const createRoadmap = async (roadmap: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...roadmap,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateRoadmap = async (id: string, roadmap: Partial<Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...roadmap,
    updatedAt: Timestamp.now(),
  });
};

export const deleteRoadmap = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
