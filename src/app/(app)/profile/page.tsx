"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress } from '@/lib/firebase/progress';
import { getActivityHistory } from '@/lib/firebase/activity';
import { getBadges, getUserBadges } from '@/lib/firebase/badges';
import { getTopicProgress } from '@/lib/firebase/analytics';

import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { PublicProfileHeader } from '@/components/profile/PublicProfileHeader';
import { ProfileStatsOverview } from '@/components/profile/ProfileStatsOverview';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { profile } = useAuth();
  
  const [data, setData] = useState<{
    problems: any[];
    topics: any[];
    progress: any[];
    activity: any[];
    badges: any[];
    userBadges: any[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRoadmaps, allTopics, allProblems, allBadges] = await Promise.all([
          getRoadmaps(),
          getTopics(),
          getProblems(),
          getBadges(),
        ]);
        
        const activeRoadmaps = allRoadmaps.filter(r => r.isActive);
        const dsaRoadmap = activeRoadmaps.find(r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')) || activeRoadmaps[0];
        
        if (profile?.uid) {
          const [userProgress, earnedBadges, userActivity] = await Promise.all([
            dsaRoadmap ? getUserRoadmapProgress(profile.uid, dsaRoadmap.id) : Promise.resolve([]),
            getUserBadges(profile.uid),
            getActivityHistory(profile.uid, 365)
          ]);
          
          setData({
            problems: allProblems.filter(p => p.isActive && p.roadmapId === dsaRoadmap?.id),
            topics: allTopics.filter(t => t.isActive && t.roadmapId === dsaRoadmap?.id),
            progress: userProgress,
            activity: userActivity,
            badges: allBadges.filter(b => b.isActive),
            userBadges: earnedBadges
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (profile?.uid) fetchData();
  }, [profile?.uid]);

  const copyProfileLink = () => {
    if (!profile?.username) return;
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topicProgress = useMemo(() => {
    if (!data) return [];
    return getTopicProgress(data.topics, data.problems, data.progress);
  }, [data]);

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and view your progress.</p>
        </div>
        
        {profile.isPublicProfile && profile.username && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyProfileLink}>
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Link href={`/profile/${profile.username}`}>
              <Button variant="secondary">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <ProfileEditor />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
          <PublicProfileHeader profile={profile} />
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <ProfileStatsOverview 
              completedProblemsCount={data.progress.filter(p => p.completed).length}
              totalProblemsCount={data.problems.length}
              topicProgress={topicProgress}
              userBadges={data.userBadges}
              badges={data.badges}
              activity={data.activity}
              currentStreak={profile.currentStreak || 0}
              longestStreak={profile.longestStreak || 0}
            />
          ) : null}
        </div>
      </div>
      
    </div>
  );
}
