import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopicProgressList } from '@/components/analytics/TopicProgressList';
import { BadgeCard } from '@/components/dashboard/BadgeCard';
import { UserBadge, Badge } from '@/types';
import { Target, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';

interface ProfileStatsOverviewProps {
  completedProblemsCount: number;
  totalProblemsCount: number;
  topicProgress: any[];
  userBadges: UserBadge[];
  badges: Badge[];
  activity: any[];
  currentStreak: number;
  longestStreak: number;
  isPublicView?: boolean;
}

export function ProfileStatsOverview({
  completedProblemsCount,
  totalProblemsCount,
  topicProgress,
  userBadges,
  badges,
  activity,
  currentStreak,
  longestStreak,
  isPublicView = false
}: ProfileStatsOverviewProps) {
  
  const completionPercent = totalProblemsCount > 0 ? Math.round((completedProblemsCount / totalProblemsCount) * 100) : 0;
  
  const recentBadges = [...userBadges]
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              DSA Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">{completedProblemsCount}</span>
              <span className="text-sm text-muted-foreground">/ {totalProblemsCount} problems</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="text-xs text-right text-muted-foreground">{completionPercent}% Complete</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Recent Achievements
            </CardTitle>
            {!isPublicView && (
              <Link href="/achievements">
                <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="pt-6">
             {recentBadges.length > 0 ? (
               <div className="flex flex-col gap-3">
                 {recentBadges.map(ub => {
                   const badgeDef = badges.find(b => b.id === ub.badgeId);
                   if (!badgeDef) return null;
                   return (
                     <div key={ub.id} className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                         <span className="text-xl">{badgeDef.icon}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium truncate">{badgeDef.name}</p>
                         <p className="text-xs text-muted-foreground truncate">{badgeDef.description}</p>
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="text-center py-4">
                 <p className="text-sm text-muted-foreground">No achievements unlocked yet.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <ActivityHeatmap 
        activity={activity}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />
      
      {/* Topics */}
      <TopicProgressList topicProgress={topicProgress} />

    </div>
  );
}
