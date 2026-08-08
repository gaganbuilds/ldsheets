import { collection, doc, getDocs, getDoc, updateDoc, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { UserActivity, UserProfile } from '@/types';

const ACTIVITY_COLLECTION = 'user_activity';
const USERS_COLLECTION = 'users';

export const getActivityHistory = async (userId: string, limitDays = 365): Promise<UserActivity[]> => {
  if (!userId) return [];
  
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - limitDays);
  const startDate = `${threshold.getFullYear()}-${String(threshold.getMonth() + 1).padStart(2, '0')}-${String(threshold.getDate()).padStart(2, '0')}`;
  
  const q = query(
    collection(db, ACTIVITY_COLLECTION),
    where('userId', '==', userId),
    where('dateKey', '>=', startDate)
  );
  
  const snapshot = await getDocs(q);
  const activities = snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserActivity;
  });

  return activities.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};

/**
 * Calculates current and longest streak based on activity history.
 * A streak increments for each contiguous day where problemsCompleted > 0.
 * If there is no activity today AND no activity yesterday, the streak is 0.
 */
export const recalculateStreak = async (userId: string): Promise<void> => {
  // Fetch up to the last 1000 days of activity to be safe for longest streak calculation
  const history = await getActivityHistory(userId, 1000);
  
  if (history.length === 0) {
    // Reset to 0
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      currentStreak: 0,
      updatedAt: Timestamp.now()
    });
    return;
  }
  
  // Filter only active days
  const activeDays = history.filter(a => a.problemsCompleted > 0).map(a => a.dateKey).sort((a, b) => b.localeCompare(a));
  
  if (activeDays.length === 0) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      currentStreak: 0,
      updatedAt: Timestamp.now()
    });
    return;
  }

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const yesterdayDate = new Date(d);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
  
  let currentStreak = 0;
  let longestStreak = 0;
  
  // Calculate longest streak
  let tempStreak = 1;
  longestStreak = 1;
  
  for (let i = 0; i < activeDays.length - 1; i++) {
    const current = new Date(activeDays[i]);
    const previous = new Date(activeDays[i+1]); // moving backwards in time
    
    // Calculate difference in days
    const diffTime = Math.abs(current.getTime() - previous.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }
  
  // Calculate current streak
  // The current streak must start from today OR yesterday. 
  // If activeDays[0] (most recent active day) is neither today nor yesterday, streak is broken.
  if (activeDays[0] === today || activeDays[0] === yesterday) {
    currentStreak = 1;
    for (let i = 0; i < activeDays.length - 1; i++) {
      const current = new Date(activeDays[i]);
      const previous = new Date(activeDays[i+1]); 
      
      const diffTime = Math.abs(current.getTime() - previous.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
  }
  
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  const isPublic = userSnap.exists() ? userSnap.data().isPublicProfile : false;
  
  await updateDoc(userRef, {
    currentStreak,
    longestStreak,
    updatedAt: Timestamp.now()
  });
  
  if (isPublic) {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'public_profiles', userId), {
      currentStreak,
      longestStreak,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
};
