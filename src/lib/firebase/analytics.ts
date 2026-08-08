import { Problem, Topic, UserProgress, UserActivity, UserBadge, Badge } from '@/types';

// Utility to filter items by a rolling day window (e.g., last 7, 30, 90 days)
const filterByDays = <T extends { dateKey?: string; awardedAt?: Date }>(
  items: T[], 
  days: number | 'all'
) => {
  if (days === 'all') return items;
  
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  
  return items.filter(item => {
    if (item.awardedAt) return item.awardedAt >= threshold;
    if (item.dateKey) return new Date(item.dateKey) >= threshold;
    return true;
  });
};

export const getDifficultyProgress = (
  problems: Problem[], 
  progress: UserProgress[]
) => {
  const activeProblems = problems.filter(p => p.isActive);
  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.problemId));
  
  const stats = {
    Easy: { completed: 0, total: 0 },
    Medium: { completed: 0, total: 0 },
    Hard: { completed: 0, total: 0 }
  };
  
  activeProblems.forEach(p => {
    if (stats[p.difficulty]) {
      stats[p.difficulty].total++;
      if (completedIds.has(p.id)) {
        stats[p.difficulty].completed++;
      }
    }
  });
  
  return stats;
};

export const getTopicProgress = (
  topics: Topic[], 
  problems: Problem[], 
  progress: UserProgress[]
) => {
  const activeTopics = topics.filter(t => t.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const activeProblems = problems.filter(p => p.isActive);
  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.problemId));
  
  return activeTopics.map(topic => {
    const topicProblems = activeProblems.filter(p => p.topicId === topic.id);
    const completedCount = topicProblems.filter(p => completedIds.has(p.id)).length;
    const totalCount = topicProblems.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      topic,
      completed: completedCount,
      total: totalCount,
      percentage
    };
  });
};

export const getStrongestAndWeakestTopics = (topicProgress: ReturnType<typeof getTopicProgress>) => {
  const validTopics = topicProgress.filter(t => t.total > 0);
  if (validTopics.length < 2) return { strongest: null, weakest: null };
  
  // Sort by percentage descending
  const sorted = [...validTopics].sort((a, b) => b.percentage - a.percentage);
  
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  
  return {
    strongest: strongest.completed > 0 ? strongest : null,
    weakest: weakest.percentage < 100 ? weakest : null
  };
};

export const getActivityTrend = (
  activity: UserActivity[], 
  days: number | 'all'
) => {
  const filtered = filterByDays(activity, days);
  
  // To build a continuous chart, we should ideally fill in the gaps with 0
  // But for lightweight native bars, we just need the raw data grouped by date if we want a line/bar chart.
  // We'll return the filtered activity reversed so it's chronological (oldest to newest)
  const chronological = [...filtered].reverse();
  
  let totalProblems = 0;
  chronological.forEach(a => totalProblems += a.problemsCompleted);
  
  return {
    trend: chronological,
    totalCompletedInPeriod: totalProblems,
    activeDays: chronological.filter(a => a.problemsCompleted > 0).length
  };
};

export const getXPTrend = (
  xpHistory: any[], 
  days: number | 'all'
) => {
  const filtered = filterByDays(xpHistory, days);
  const chronological = [...filtered].reverse();
  
  let totalXP = 0;
  
  // Group by date for a simple chart
  const groupedByDate = new Map<string, number>();
  
  chronological.forEach(record => {
    totalXP += record.xp;
    const dateKey = record.awardedAt.toISOString().split('T')[0];
    groupedByDate.set(dateKey, (groupedByDate.get(dateKey) || 0) + record.xp);
  });
  
  const trend = Array.from(groupedByDate.entries()).map(([dateKey, xp]) => ({ dateKey, xp }));
  
  return {
    trend,
    totalXPInPeriod: totalXP
  };
};

export const getBadgeSummary = (userBadges: UserBadge[], badges: Badge[]) => {
  const totalEarned = userBadges.length;
  const recent = [...userBadges]
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 3)
    .map(ub => ({
      userBadge: ub,
      badge: badges.find(b => b.id === ub.badgeId)
    }))
    .filter(x => x.badge); // remove undefined
    
  return {
    totalEarned,
    recent,
    totalAvailable: badges.length
  };
};
