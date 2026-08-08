import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { Topic } from '@/types';

const COLLECTION_NAME = 'topics';

export const getTopics = async (roadmapId?: string): Promise<Topic[]> => {
  let q = collection(db, COLLECTION_NAME) as any;
  if (roadmapId) {
    q = query(q, where('roadmapId', '==', roadmapId), orderBy('displayOrder', 'asc'));
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
  }) as Topic[];
};

export const getTopic = async (id: string): Promise<Topic | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Topic;
  }
  return null;
};

export const getTopicBySlug = async (slug: string): Promise<Topic | null> => {
  const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Topic;
  }
  return null;
};

export const createTopic = async (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...topic,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateTopic = async (id: string, topic: Partial<Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...topic,
    updatedAt: Timestamp.now(),
  });
};

export const deleteTopic = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
