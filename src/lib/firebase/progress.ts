import { collection, doc, getDocs, addDoc, updateDoc, query, where, Timestamp, runTransaction, increment } from 'firebase/firestore';
import { db } from './config';
import { UserProgress } from '@/types';
import { getSettings } from './settings';
import { calculateLevel } from '../gamification';

const COLLECTION_NAME = 'user_progress';
const XP_HISTORY_COL = 'xp_history';
const USERS_COL = 'users';

export const getUserProblemProgress = async (userId: string, topicId?: string): Promise<UserProgress[]> => {
  if (!userId) return [];
  
  let q = collection(db, COLLECTION_NAME) as any;
  if (topicId) {
    q = query(q, where('userId', '==', userId), where('topicId', '==', topicId));
  } else {
    q = query(q, where('userId', '==', userId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate() || null,
    } as UserProgress;
  });
};

export const markProblemComplete = async (
  userId: string, 
  problemId: string, 
  roadmapId: string, 
  topicId: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  existingProgressId?: string
): Promise<{ progressId: string, xpAwarded: number }> => {
  const now = Timestamp.now();
  
  let awardedXP = 0;
  
  try {
    await runTransaction(db, async (transaction) => {
      // 1. Check if XP history already exists for this exact problem and user
      const xpHistoryRef = doc(db, XP_HISTORY_COL, `${userId}_${problemId}`);
      const xpHistorySnap = await transaction.get(xpHistoryRef);
      
      let xpToAward = 0;
      
      if (!xpHistorySnap.exists()) {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await transaction.get(settingsRef);
        
        let xpValues = { easyXP: 10, mediumXP: 25, hardXP: 50 };
        if (settingsSnap.exists()) {
           xpValues = settingsSnap.data() as any;
        }
        
        if (difficulty === 'Easy') xpToAward = xpValues.easyXP || 10;
        else if (difficulty === 'Medium') xpToAward = xpValues.mediumXP || 25;
        else if (difficulty === 'Hard') xpToAward = xpValues.hardXP || 50;
        
        if (xpToAward > 0) {
           awardedXP = xpToAward;
           
           const userRef = doc(db, USERS_COL, userId);
           const userSnap = await transaction.get(userRef);
           
           let newTotalXP = xpToAward;
           let completedCount = 1;
           if (userSnap.exists()) {
             newTotalXP = (userSnap.data().totalXP || 0) + xpToAward;
             completedCount = (userSnap.data().completedProblems || 0) + 1;
           }
           
           const newLevel = calculateLevel(newTotalXP);
           
           transaction.set(xpHistoryRef, {
             userId,
             problemId,
             xp: xpToAward,
             difficulty,
             reason: 'problem_completion',
             awardedAt: now
           });
           
           transaction.update(userRef, {
             totalXP: newTotalXP,
             level: newLevel,
             completedProblems: completedCount,
             lastProblemId: problemId,
             updatedAt: now
           });
           
           if (userSnap.data()?.isPublicProfile) {
             const publicRef = doc(db, 'public_profiles', userId);
             transaction.set(publicRef, {
               totalXP: newTotalXP,
               level: newLevel,
               completedProblems: completedCount,
               updatedAt: now
             }, { merge: true });
           }
        }
      }
      
      // Update Daily Activity inside transaction
      const jsNow = now.toDate();
      const dateKey = `${jsNow.getFullYear()}-${String(jsNow.getMonth() + 1).padStart(2, '0')}-${String(jsNow.getDate()).padStart(2, '0')}`;
      const activityRef = doc(db, 'user_activity', `${userId}_${dateKey}`);
      const activitySnap = await transaction.get(activityRef);
      
      if (activitySnap.exists()) {
        transaction.update(activityRef, {
          problemsCompleted: increment(1),
          xpEarned: increment(awardedXP),
          updatedAt: now
        });
      } else {
        transaction.set(activityRef, {
          userId,
          date: now,
          dateKey,
          problemsCompleted: 1,
          xpEarned: awardedXP,
          createdAt: now,
          updatedAt: now
        });
      }
      
      // Finally update progress
      const targetProgressId = `${userId}_${problemId}`;
      const progRef = doc(db, COLLECTION_NAME, targetProgressId);
      
      if (existingProgressId) {
        transaction.update(progRef, {
          completed: true,
          completedAt: now,
          updatedAt: now
        });
        existingProgressId = targetProgressId;
      } else {
        existingProgressId = targetProgressId; 
        transaction.set(progRef, {
          userId,
          problemId,
          roadmapId,
          topicId,
          completed: true,
          completedAt: now,
          createdAt: now,
          updatedAt: now
        });
      }
    });
    
    // Recalculate streak after transaction completes
    import('./activity').then(m => m.recalculateStreak(userId));
    
    return { progressId: existingProgressId as string, xpAwarded: awardedXP };
    
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
};

export const markProblemIncomplete = async (progressId: string, userId: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const docRef = doc(db, COLLECTION_NAME, progressId);
      const docSnap = await transaction.get(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.completed && data.completedAt) {
          // Decrement historical activity
          const jsCompleted = data.completedAt.toDate();
          const dateKey = `${jsCompleted.getFullYear()}-${String(jsCompleted.getMonth() + 1).padStart(2, '0')}-${String(jsCompleted.getDate()).padStart(2, '0')}`;
          const activityRef = doc(db, 'user_activity', `${userId}_${dateKey}`);
          const activitySnap = await transaction.get(activityRef);
          
          if (activitySnap.exists()) {
            const currentProblems = activitySnap.data().problemsCompleted || 0;
            // Prevent negative problems count
            if (currentProblems > 0) {
              transaction.update(activityRef, {
                problemsCompleted: increment(-1),
                updatedAt: Timestamp.now()
              });
            }
          }
        }
        
        transaction.update(docRef, {
          completed: false,
          completedAt: null,
          updatedAt: Timestamp.now(),
        });
      }
    });
    
    // Recalculate streak after transaction completes
    import('./activity').then(m => m.recalculateStreak(userId));
    
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
};

export const getUserTopicProgress = async (userId: string, roadmapId: string): Promise<UserProgress[]> => {
  if (!userId || !roadmapId) return [];
  const q = query(
    collection(db, COLLECTION_NAME), 
    where('userId', '==', userId), 
    where('roadmapId', '==', roadmapId),
    where('completed', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate() || null,
  })) as UserProgress[];
};

export const getUserRoadmapProgress = async (userId: string, roadmapId: string): Promise<UserProgress[]> => {
  // It's the same logic, we just fetch all completed records for the user within that roadmap.
  return getUserTopicProgress(userId, roadmapId);
};

export const getXPHistory = async (userId: string): Promise<any[]> => {
  if (!userId) return [];
  // For lightweight fetching, fetch all for user. 
  const q = query(
    collection(db, XP_HISTORY_COL),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const history = snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      awardedAt: data.awardedAt?.toDate() || new Date(),
    };
  });
  
  // Sort descending by date in memory to avoid needing composite index
  return history.sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime());
};
