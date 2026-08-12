export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthProvider = 'email' | 'google';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  username?: string;
  bio?: string;
  isPublicProfile?: boolean;
  provider: AuthProvider;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  completedProblems: number;
  isAdmin: boolean;
}

export interface Roadmap extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Topic extends BaseEntity {
  roadmapId: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem extends BaseEntity {
  roadmapId: string;
  topicId: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  externalURL: string;
  estimatedTime: number; // in minutes
  tags: string[];
  companies: string[];
  displayOrder: number;
  isActive: boolean;
  premium: boolean;
  videoURL?: string;
  articleURL?: string;
  hint?: string;
  description?: string;
  supportedLanguages?: string[];
  testCases?: TestCase[];
}

export interface Settings {
  easyXP: number;
  mediumXP: number;
  hardXP: number;
}

export interface UserProgress extends BaseEntity {
  userId: string;
  problemId: string;
  roadmapId: string;
  topicId: string;
  completed: boolean;
  completedAt: Date | null;
}

export interface UserNote extends BaseEntity {
  userId: string;
  problemId: string;
  content: string;
}

export interface UserBookmark extends BaseEntity {
  userId: string;
  problemId: string;
}

export interface XpHistory extends BaseEntity {
  userId: string;
  problemId: string;
  xp: number;
  difficulty: string;
  reason: string;
  awardedAt: Date;
}

export type BadgeCategory = 'Problems' | 'XP' | 'Topics' | 'Milestones';
export type RequirementType = 'problems_completed' | 'total_xp' | 'topic_completed';

export interface Badge extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirementType: RequirementType;
  requirementValue: number;
  xpReward: number;
  isActive: boolean;
}

export interface UserBadge extends BaseEntity {
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  xpReward: number;
  notificationShown: boolean;
}

export interface UserActivity extends BaseEntity {
  userId: string;
  date: Date;
  dateKey: string;
  problemsCompleted: number;
  xpEarned: number;
}
