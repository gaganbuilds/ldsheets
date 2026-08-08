import { doc, getDocs, collection, runTransaction, Timestamp, query, where } from 'firebase/firestore';
import { db } from './firebase/config';
import { Badge, UserBadge } from '@/types';
import { calculateLevel } from './gamification';

const BADGES_COLLECTION = 'badges';
const USER_BADGES_COLLECTION = 'user_badges';
const USERS_COLLECTION = 'users';

export interface UnlockedBadgeResult {
  badge: Badge;
  userBadge: UserBadge;
}

/**
 * Evaluates whether a user has met the requirements for any active badges they haven't already unlocked.
 * If requirements are met, it securely awards the badge and associated XP in a Firestore transaction.
 */
export const evaluateUserBadges = async (userId: string): Promise<UnlockedBadgeResult[]> => {
  if (!userId) return [];
  
  const now = Timestamp.now();
  const unlockedBadges: UnlockedBadgeResult[] = [];
  
  try {
    // 1. Fetch all active badges (outside transaction because it's a query)
    const badgesSnap = await getDocs(query(collection(db, BADGES_COLLECTION), where('isActive', '==', true)));
    const allBadges = badgesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Badge));
    
    if (allBadges.length === 0) return [];
    
    // 2. Run Transaction to evaluate and award
    await runTransaction(db, async (transaction) => {
      // Fetch user data (completedProblems, totalXP)
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await transaction.get(userRef);
      
      if (!userSnap.exists()) return;
      const userData = userSnap.data();
      let currentTotalXP = userData.totalXP || 0;
      const currentCompletedProblems = userData.completedProblems || 0;
      
      // Determine which badges the user meets requirements for
      const candidateBadges = allBadges.filter(badge => {
        if (badge.requirementType === 'problems_completed') {
          return currentCompletedProblems >= badge.requirementValue;
        }
        if (badge.requirementType === 'total_xp') {
          return currentTotalXP >= badge.requirementValue;
        }
        // Add more requirement types here (e.g. topic_completed)
        return false;
      });
      
      if (candidateBadges.length === 0) return;
      
      let newXPToAward = 0;
      
      // Check which of the candidate badges are already unlocked
      for (const badge of candidateBadges) {
        const userBadgeRef = doc(db, USER_BADGES_COLLECTION, `${userId}_${badge.id}`);
        const userBadgeSnap = await transaction.get(userBadgeRef);
        
        if (!userBadgeSnap.exists()) {
          // Unlock this badge!
          const badgeXP = badge.xpReward || 0;
          newXPToAward += badgeXP;
          
          const newUserBadge = {
            userId,
            badgeId: badge.id,
            unlockedAt: now,
            xpReward: badgeXP,
            notificationShown: true, // We will show it immediately after this function returns
            createdAt: now,
            updatedAt: now,
          };
          
          transaction.set(userBadgeRef, newUserBadge);
          
          unlockedBadges.push({
            badge,
            userBadge: { id: userBadgeRef.id, ...newUserBadge } as unknown as UserBadge
          });
        }
      }
      
      // If we awarded any XP from badges, update the user profile
      if (newXPToAward > 0) {
        currentTotalXP += newXPToAward;
        const newLevel = calculateLevel(currentTotalXP);
        
        transaction.update(userRef, {
          totalXP: currentTotalXP,
          level: newLevel,
          updatedAt: now
        });
        
        if (userData.isPublicProfile) {
          const publicRef = doc(db, 'public_profiles', userId);
          transaction.set(publicRef, {
            totalXP: currentTotalXP,
            level: newLevel,
            updatedAt: now
          }, { merge: true });
        }
      }
    });
    
  } catch (error) {
    console.error("Failed to evaluate badges in transaction:", error);
  }
  
  return unlockedBadges;
};
