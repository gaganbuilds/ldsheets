import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from './config';
import { Badge, UserBadge, BadgeCategory, RequirementType } from '@/types';

const BADGES_COLLECTION = 'badges';
const USER_BADGES_COLLECTION = 'user_badges';

export const getBadges = async (): Promise<Badge[]> => {
  const snapshot = await getDocs(collection(db, BADGES_COLLECTION));
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Badge;
  });
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  if (!userId) return [];
  const q = query(collection(db, USER_BADGES_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      unlockedAt: data.unlockedAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserBadge;
  });
};

const INITIAL_BADGES: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'First Step',
    description: 'Completed your first problem.',
    icon: 'Trophy',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 1,
    xpReward: 10,
    isActive: true,
  },
  {
    name: 'Getting Started',
    description: 'Completed 5 problems.',
    icon: 'Star',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 5,
    xpReward: 25,
    isActive: true,
  },
  {
    name: 'Problem Solver',
    description: 'Completed 10 problems.',
    icon: 'Target',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 10,
    xpReward: 50,
    isActive: true,
  },
  {
    name: 'Rising Coder',
    description: 'Completed 25 problems.',
    icon: 'Zap',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 25,
    xpReward: 100,
    isActive: true,
  },
  {
    name: 'DSA Warrior',
    description: 'Completed 50 problems.',
    icon: 'Shield',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 50,
    xpReward: 200,
    isActive: true,
  },
  {
    name: 'Century',
    description: 'Completed 100 problems.',
    icon: 'Crown',
    category: 'Problems',
    requirementType: 'problems_completed',
    requirementValue: 100,
    xpReward: 500,
    isActive: true,
  },
  {
    name: 'XP Starter',
    description: 'Earned 100 total XP.',
    icon: 'Coins',
    category: 'XP',
    requirementType: 'total_xp',
    requirementValue: 100,
    xpReward: 25,
    isActive: true,
  },
  {
    name: 'XP Hunter',
    description: 'Earned 500 total XP.',
    icon: 'Medal',
    category: 'XP',
    requirementType: 'total_xp',
    requirementValue: 500,
    xpReward: 100,
    isActive: true,
  },
  {
    name: 'XP Master',
    description: 'Earned 1000 total XP.',
    icon: 'Diamond',
    category: 'XP',
    requirementType: 'total_xp',
    requirementValue: 1000,
    xpReward: 250,
    isActive: true,
  }
];

// Utility to populate DB initially
export const seedInitialBadges = async (): Promise<void> => {
  try {
    const existing = await getBadges();
    if (existing.length > 0) {
      return; // Already seeded
    }

    for (const badge of INITIAL_BADGES) {
      // Generate an ID based on name for idempotency
      const docId = badge.name.toLowerCase().replace(/\s+/g, '-');
      const ref = doc(db, BADGES_COLLECTION, docId);
      await setDoc(ref, {
        ...badge,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    // If a non-admin student hits this on an empty database, it will throw PERMISSION_DENIED.
    // We swallow this error so the dashboard continues to load. 
    // Badges must be seeded by an admin.
    console.warn('Could not seed initial badges (requires admin privileges):', error);
  }
};
