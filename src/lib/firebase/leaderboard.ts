import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { UserProfile } from '@/types';

const PUBLIC_PROFILES = 'public_profiles';

export interface LeaderboardPageResult {
  users: UserProfile[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Fetches a paginated list of public users ordered by totalXP, completedProblems, and uid.
 */
export const getLeaderboardPage = async (
  pageSize: number = 25, 
  lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  searchQuery: string = ''
): Promise<LeaderboardPageResult> => {
  let q;
  
  if (searchQuery) {
    const term = searchQuery.toLowerCase().trim();
    // Prefix search on username
    q = query(
      collection(db, PUBLIC_PROFILES),
      where('username', '>=', term),
      where('username', '<=', term + '\uf8ff'),
      orderBy('username', 'asc'),
      limit(pageSize)
    );
    
    // Note: If using search, we cannot easily sort by XP because Firestore requires
    // inequality filters to be on the same field as the first orderBy.
    // So search results are ordered by username.
  } else {
    // Normal leaderboard ordering
    q = query(
      collection(db, PUBLIC_PROFILES),
      orderBy('totalXP', 'desc'),
      orderBy('completedProblems', 'desc'),
      orderBy('uid', 'desc'), // deterministic fallback
      limit(pageSize)
    );
  }

  if (lastVisibleDoc && !searchQuery) {
    q = query(
      collection(db, PUBLIC_PROFILES),
      orderBy('totalXP', 'desc'),
      orderBy('completedProblems', 'desc'),
      orderBy('uid', 'desc'),
      startAfter(lastVisibleDoc),
      limit(pageSize)
    );
  } else if (lastVisibleDoc && searchQuery) {
    const term = searchQuery.toLowerCase().trim();
    q = query(
      collection(db, PUBLIC_PROFILES),
      where('username', '>=', term),
      where('username', '<=', term + '\uf8ff'),
      orderBy('username', 'asc'),
      startAfter(lastVisibleDoc),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  
  const users: UserProfile[] = [];
  snapshot.forEach((doc) => {
    users.push(doc.data() as UserProfile);
  });

  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  const hasMore = snapshot.docs.length === pageSize;

  return { users, lastDoc, hasMore };
};

/**
 * Calculates a user's exact rank by counting how many users have strictly more XP, 
 * or same XP but more completedProblems, etc.
 */
export const getCurrentUserRank = async (
  totalXP: number,
  completedProblems: number,
  uid: string
): Promise<number | null> => {
  if (totalXP === 0 && completedProblems === 0) return null; // Unranked

  try {
    // Count users strictly higher on XP
    const higherXpQuery = query(
      collection(db, PUBLIC_PROFILES),
      where('totalXP', '>', totalXP)
    );
    const higherXpCount = await getCountFromServer(higherXpQuery);
    
    // Count users with SAME XP but more problems
    const sameXpHigherProbsQuery = query(
      collection(db, PUBLIC_PROFILES),
      where('totalXP', '==', totalXP),
      where('completedProblems', '>', completedProblems)
    );
    const sameXpHigherProbsCount = await getCountFromServer(sameXpHigherProbsQuery);
    
    // Count users with SAME XP, SAME problems but higher UID (deterministic tie breaker)
    const sameXpSameProbsHigherUidQuery = query(
      collection(db, PUBLIC_PROFILES),
      where('totalXP', '==', totalXP),
      where('completedProblems', '==', completedProblems),
      where('uid', '>', uid)
    );
    const sameXpSameProbsHigherUidCount = await getCountFromServer(sameXpSameProbsHigherUidQuery);

    const rank = higherXpCount.data().count 
               + sameXpHigherProbsCount.data().count 
               + sameXpSameProbsHigherUidCount.data().count 
               + 1; // +1 because rank is 1-indexed
               
    return rank;
  } catch (err) {
    console.error("Failed to calculate rank:", err);
    return null; // Graceful degradation
  }
};
