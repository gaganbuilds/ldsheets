'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress } from '@/lib/firebase/progress';
import { getLevelProgress } from '@/lib/gamification';
import { getBadges, getUserBadges, seedInitialBadges } from '@/lib/firebase/badges';
import { Roadmap, Topic, Problem, UserProgress, Badge, UserBadge } from '@/types';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { StatsCard } from '@/components/ui-custom/StatsCard';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { TopicProgressCard } from '@/components/dashboard/TopicProgressCard';
import { BadgeCard } from '@/components/dashboard/BadgeCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Zap, Trophy, LayoutDashboard, ChevronRight, Activity, Award } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { profile } = useAuth();
  
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        // Seed badges if they don't exist yet (Temporary logic since no Admin CMS exists for Badges)
        await seedInitialBadges();
        
        // Fetch roadmaps first to determine which topics and problems to load
        const allRoadmaps = await getRoadmaps();
        const activeRoadmaps = allRoadmaps.filter(r => r.isActive);
        setRoadmaps(activeRoadmaps);
        
        const dsaRoadmap = activeRoadmaps.find(r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')) || activeRoadmaps[0];
        
        // Fetch independent data concurrently, scoping topics and problems to the dsaRoadmap
        const [allTopics, allProblems, allBadges, earnedBadges, userActivity, userProgress] = await Promise.all([
          dsaRoadmap ? getTopics(dsaRoadmap.id) : Promise.resolve([]),
          dsaRoadmap ? getProblems(undefined, dsaRoadmap.id) : Promise.resolve([]),
          getBadges(),
          profile?.uid ? getUserBadges(profile.uid) : Promise.resolve([]),
          profile?.uid ? import('@/lib/firebase/activity').then(m => m.getActivityHistory(profile.uid)) : Promise.resolve([]),
          (profile?.uid && dsaRoadmap) ? getUserRoadmapProgress(profile.uid, dsaRoadmap.id) : Promise.resolve([])
        ]);
        
        setTopics(allTopics.filter(t => t.isActive));
        setProblems(allProblems.filter(p => p.isActive));
        setBadges(allBadges.filter(b => b.isActive));
        setUserBadges(earnedBadges);
        setActivity(userActivity);
        setProgress(userProgress);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [profile?.uid]);

  const dsaRoadmap = roadmaps.find(r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')) || roadmaps[0];
  const dsaTopics = dsaRoadmap ? topics.filter(t => t.roadmapId === dsaRoadmap.id) : [];
  const dsaProblems = dsaRoadmap ? problems.filter(p => p.roadmapId === dsaRoadmap.id) : [];

  const completedProblemsCount = progress.filter(p => p.completed).length;
  const totalProblemsCount = dsaProblems.length;
  const overallProgress = totalProblemsCount > 0 ? Math.round((completedProblemsCount / totalProblemsCount) * 100) : 0;
  
  const levelData = getLevelProgress(profile?.totalXP || 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/30 animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted/30 animate-pulse rounded-lg" />)}
        </div>
        <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <EmptyState 
          title="Error Loading Dashboard"
          description={error}
          icon={<Activity className="text-red-500" />}
          action={<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Welcome Section */}
      <SectionHeader 
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'Student'}`}
        description="Ready to continue your DSA preparation?"
      />
      
      {/* 2. Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Problems Solved" 
          value={String(completedProblemsCount)} 
          icon={<Target className="text-blue-500" />}
        />
        <StatsCard 
          title="Total XP" 
          value={String(profile?.totalXP || 0)} 
          icon={<Trophy className="text-amber-500" />}
        />
        <StatsCard 
          title="Current Level" 
          value={String(profile?.level || 1)} 
          icon={<LayoutDashboard className="text-purple-500" />}
        />
        <StatsCard 
          title="Current Streak" 
          value={`${profile?.currentStreak || 0} Days`} 
          icon={<Zap className="text-orange-500" />}
        />
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Level Progress */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex justify-between items-end">
                <span>Level Progress</span>
                <span className="text-sm font-normal text-muted-foreground">{levelData.remainingXP} XP remaining</span>
              </CardTitle>
              <CardDescription>You are at Level {levelData.currentLevel}. Keep solving problems to reach Level {levelData.currentLevel + 1}!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">Lvl {levelData.currentLevel}</span>
                <div className="h-3 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${levelData.progressPercent}%` }}
                  />
                </div>
                <span className="font-bold text-lg text-muted-foreground">Lvl {levelData.currentLevel + 1}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements Section */}
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>You have earned {userBadges.length} {userBadges.length === 1 ? 'badge' : 'badges'}</CardDescription>
              </div>
              <Link href="/achievements">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
                  {userBadges
                    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
                    .slice(0, 3)
                    .map(ub => {
                      const badgeDef = badges.find(b => b.id === ub.badgeId);
                      if (!badgeDef) return null;
                      return <BadgeCard key={ub.id} badge={badgeDef} userBadge={ub} />;
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No Badges Yet</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                    Complete problems and earn XP to start unlocking badges. Your achievements will appear here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 3 & 4. Continue Learning (Overall Progress) */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Your main roadmap progress</CardDescription>
            </CardHeader>
            <CardContent>
              {dsaRoadmap ? (
                <div className="flex flex-col sm:flex-row gap-6 items-center bg-muted/20 p-4 rounded-xl border border-border/50">
                  <div className="flex-1 space-y-2 w-full">
                    <h3 className="font-semibold text-lg">{dsaRoadmap.title}</h3>
                    <p className="text-sm text-muted-foreground">{dsaTopics.length} Topics • {dsaProblems.length} Problems</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-in-out" 
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{overallProgress}%</span>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto shrink-0" render={<Link href="/roadmap" />}>
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                  <Target className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="font-medium">No roadmap available</p>
                  <p className="text-sm text-muted-foreground mt-1">We couldn't find an active DSA roadmap. Please check back later.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Topic Progress Preview */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Current Topics</h3>
              <Button variant="link" size="sm" render={<Link href="/roadmap" />} className="p-0 h-auto self-start sm:self-auto">
                View Full Roadmap
              </Button>
            </div>
            
            {dsaTopics.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {dsaTopics.slice(0, 4).map(topic => {
                  const topicProblems = problems.filter(p => p.topicId === topic.id);
                  const completedInTopic = progress.filter(p => p.topicId === topic.id && p.completed).length; 
                  return (
                    <TopicProgressCard 
                      key={topic.id}
                      topic={topic}
                      totalProblems={topicProblems.length}
                      completedProblems={completedInTopic}
                    />
                  );
                })}
              </div>
            ) : (
               <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-xl text-center border border-dashed border-border/50">
                 No active topics found.
               </div>
            )}
          </div>

          {/* 1. Heatmap / Consistency */}
          <div className="lg:col-span-2 min-w-0">
            <ActivityHeatmap 
              activity={activity} 
              currentStreak={profile?.currentStreak || 0} 
              longestStreak={profile?.longestStreak || 0} 
            />
          </div>
        </div>
        
        <div className="space-y-6 lg:space-y-8">
          
          {/* 7. Daily Goal Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Goal</CardTitle>
              <CardDescription>Stay on track with your practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">0</span>
                <span className="text-lg text-muted-foreground font-medium">/ 3</span>
                <span className="text-sm text-muted-foreground ml-1">Problems</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `0%` }}
                />
              </div>
              <Button className="w-full" render={<Link href="/roadmap" />}>
                Start Solving
              </Button>
            </CardContent>
          </Card>

          {/* 6. Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-10 text-center flex flex-col items-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-semibold mb-1">No activity yet</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">You haven't solved any problems recently.</p>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
