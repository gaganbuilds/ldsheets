"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress, getXPHistory } from '@/lib/firebase/progress';
import { getActivityHistory } from '@/lib/firebase/activity';
import { getBadges, getUserBadges } from '@/lib/firebase/badges';
import { 
  getDifficultyProgress, 
  getTopicProgress, 
  getStrongestAndWeakestTopics,
  getActivityTrend,
  getXPTrend,
  getBadgeSummary
} from '@/lib/firebase/analytics';

import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { StatsCard } from '@/components/ui-custom/StatsCard';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { SimpleBarChart, DifficultyProgress } from '@/components/analytics/AnalyticsCharts';
import { TopicProgressList } from '@/components/analytics/TopicProgressList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Zap, Trophy, LayoutDashboard, Activity, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AnalyticsPage() {
  const { profile } = useAuth();
  
  const [data, setData] = useState<{
    problems: any[];
    topics: any[];
    progress: any[];
    activity: any[];
    xpHistory: any[];
    badges: any[];
    userBadges: any[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number | 'all'>(30);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        
        const allRoadmaps = await getRoadmaps();
        const activeRoadmaps = allRoadmaps.filter(r => r.isActive);
        const dsaRoadmap = activeRoadmaps.find(r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')) || activeRoadmaps[0];
        
        if (profile?.uid) {
          const [allTopics, allProblems, allBadges, userProgress, earnedBadges, userActivity, xpHistoryData] = await Promise.all([
            dsaRoadmap ? getTopics(dsaRoadmap.id) : Promise.resolve([]),
            dsaRoadmap ? getProblems(undefined, dsaRoadmap.id) : Promise.resolve([]),
            getBadges(),
            dsaRoadmap ? getUserRoadmapProgress(profile.uid, dsaRoadmap.id) : Promise.resolve([]),
            getUserBadges(profile.uid),
            getActivityHistory(profile.uid, 365),
            getXPHistory(profile.uid)
          ]);
          
          setData({
            problems: allProblems.filter(p => p.isActive),
            topics: allTopics.filter(t => t.isActive),
            progress: userProgress,
            activity: userActivity,
            xpHistory: xpHistoryData,
            badges: allBadges.filter(b => b.isActive),
            userBadges: earnedBadges
          });
        }
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [profile?.uid]);

  const insights = useMemo(() => {
    if (!data) return null;
    
    const difficultyStats = getDifficultyProgress(data.problems, data.progress);
    const topicProgress = getTopicProgress(data.topics, data.problems, data.progress);
    const { strongest, weakest } = getStrongestAndWeakestTopics(topicProgress);
    const activityTrend = getActivityTrend(data.activity, daysFilter);
    const xpTrend = getXPTrend(data.xpHistory, daysFilter);
    const badgeSummary = getBadgeSummary(data.userBadges, data.badges);
    
    const completedCount = data.progress.filter(p => p.completed).length;
    const totalCount = data.problems.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      difficultyStats,
      topicProgress,
      strongest,
      weakest,
      activityTrend,
      xpTrend,
      badgeSummary,
      completedCount,
      totalCount,
      completionPercent
    };
  }, [data, daysFilter]);

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

  if (error || !insights || !data) {
    return (
      <div className="mt-8">
        <EmptyState 
          title="Error Loading Analytics"
          description={error || "Something went wrong."}
          icon={<Activity className="text-red-500" />}
          action={<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>}
        />
      </div>
    );
  }
  
  if (insights.completedCount === 0) {
    return (
      <div className="space-y-8 pb-8">
        <SectionHeader 
          title="DSA Analytics"
          description="Track your preparation progress and consistency over time."
        />
        <EmptyState 
          title="Start Solving Problems"
          description="Complete your first problem to start seeing analytics."
          icon={<Target className="text-muted-foreground" />}
          action={<Link href="/roadmap"><Button>Go to Roadmap</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader 
          title="DSA Analytics"
          description="Track your preparation progress and consistency over time."
        />
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
          <Select value={String(daysFilter)} onValueChange={(val) => setDaysFilter(val === 'all' ? 'all' : Number(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* 1. Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Problems Solved" 
          value={`${insights.completedCount} / ${insights.totalCount}`} 
          icon={<Target className="text-blue-500" />}
        />
        <StatsCard 
          title="Overall Progress" 
          value={`${insights.completionPercent}%`} 
          icon={<Activity className="text-green-500" />}
        />
        <StatsCard 
          title="Total XP" 
          value={String(profile?.totalXP || 0)} 
          icon={<Trophy className="text-amber-500" />}
        />
        <StatsCard 
          title="Current Streak" 
          value={`${profile?.currentStreak || 0} Days`} 
          icon={<Zap className="text-orange-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress & Difficulty */}
        <div className="space-y-6 lg:col-span-1">
          <DifficultyProgress stats={insights.difficultyStats} />
          
          {/* Insights Snippet */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">You've solved <span className="font-semibold">{insights.completedCount}</span> problems so far.</p>
              </div>
              <div className="flex items-start gap-3">
                <FlameIcon className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm">You've maintained a <span className="font-semibold">{profile?.currentStreak || 0}-day</span> streak.</p>
              </div>
              {insights.strongest && (
                <div className="flex items-start gap-3">
                  <Trophy className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm"><span className="font-semibold">{insights.strongest.topic.title}</span> is your strongest topic ({insights.strongest.percentage}%).</p>
                </div>
              )}
              {insights.weakest && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm"><span className="font-semibold">{insights.weakest.topic.title}</span> needs more practice ({insights.weakest.percentage}%).</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trends */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2 h-[220px]">
            <SimpleBarChart 
              title={`Activity Trend (${insights.activityTrend.activeDays} active days)`}
              data={insights.activityTrend.trend.map(a => ({ label: a.dateKey, value: a.problemsCompleted }))}
              colorClass="bg-blue-500"
            />
            <SimpleBarChart 
              title={`XP Trend (${insights.xpTrend.totalXPInPeriod} XP earned)`}
              data={insights.xpTrend.trend.map(x => ({ label: x.dateKey, value: x.xp }))}
              colorClass="bg-amber-500"
            />
          </div>
          
          <Card>
            <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Badge Summary
                </CardTitle>
              </div>
              <Link href="/achievements">
                <Button variant="outline" size="sm">View All Achievements</Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="text-center sm:text-left sm:w-1/4">
                  <div className="text-4xl font-bold text-primary mb-1">{insights.badgeSummary.totalEarned}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                  <div className="text-xs text-muted-foreground mt-1">Out of {insights.badgeSummary.totalAvailable} total</div>
                </div>
                
                <div className="flex-1 w-full">
                  <h4 className="text-sm font-medium mb-3">Recently Unlocked</h4>
                  {insights.badgeSummary.recent.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {insights.badgeSummary.recent.map(r => (
                        <div key={r.userBadge.id} className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-medium">{r.badge?.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No badges unlocked recently.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TopicProgressList topicProgress={insights.topicProgress} />

      <ActivityHeatmap 
        activity={data.activity}
        currentStreak={profile?.currentStreak || 0}
        longestStreak={profile?.longestStreak || 0}
      />
      
    </div>
  );
}

// Small helper component for the Flame icon since lucide-react Flame is sometimes not imported correctly depending on version.
// Using Zap as fallback if Flame isn't perfectly mapped. Let's just import it at top, wait I didn't import Flame at top.
function FlameIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
