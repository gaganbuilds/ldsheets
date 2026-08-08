"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getPublicProfile } from '@/lib/firebase/profile';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress } from '@/lib/firebase/progress';
import { getActivityHistory } from '@/lib/firebase/activity';
import { getBadges, getUserBadges } from '@/lib/firebase/badges';
import { getTopicProgress } from '@/lib/firebase/analytics';
import { UserProfile } from '@/types';

import { PublicProfileHeader } from '@/components/profile/PublicProfileHeader';
import { ProfileStatsOverview } from '@/components/profile/ProfileStatsOverview';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [data, setData] = useState<{
    problems: any[];
    topics: any[];
    progress: any[];
    activity: any[];
    badges: any[];
    userBadges: any[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const pubProfile = await getPublicProfile(username);
        
        if (!pubProfile) {
          setError(true);
          setIsLoading(false);
          return;
        }
        
        setProfile(pubProfile);
        
        // Fetch global static data
        const [allRoadmaps, allTopics, allProblems, allBadges] = await Promise.all([
          getRoadmaps(),
          getTopics(),
          getProblems(),
          getBadges(),
        ]);
        
        const activeRoadmaps = allRoadmaps.filter(r => r.isActive);
        const dsaRoadmap = activeRoadmaps.find(r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')) || activeRoadmaps[0];
        
        // Fetch user-specific public data using their UID
        const [userProgress, earnedBadges, userActivity] = await Promise.all([
          dsaRoadmap ? getUserRoadmapProgress(pubProfile.uid, dsaRoadmap.id) : Promise.resolve([]),
          getUserBadges(pubProfile.uid),
          getActivityHistory(pubProfile.uid, 365)
        ]);
        
        setData({
          problems: allProblems.filter(p => p.isActive && p.roadmapId === dsaRoadmap?.id),
          topics: allTopics.filter(t => t.isActive && t.roadmapId === dsaRoadmap?.id),
          progress: userProgress,
          activity: userActivity,
          badges: allBadges.filter(b => b.isActive),
          userBadges: earnedBadges
        });
        
      } catch (err) {
        console.error("Failed to fetch public profile:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (username) fetchPublicData();
  }, [username]);

  const topicProgress = useMemo(() => {
    if (!data) return [];
    return getTopicProgress(data.topics, data.problems, data.progress);
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="pt-20">
        <EmptyState 
          title="Profile Not Found"
          description="This profile does not exist or has been set to private."
          icon={<ShieldAlert className="text-muted-foreground" />}
          action={
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto pt-8">
      <PublicProfileHeader profile={profile} />
      
      {data && (
        <ProfileStatsOverview 
          completedProblemsCount={data.progress.filter(p => p.completed).length}
          totalProblemsCount={data.problems.length}
          topicProgress={topicProgress}
          userBadges={data.userBadges}
          badges={data.badges}
          activity={data.activity}
          currentStreak={profile.currentStreak || 0}
          longestStreak={profile.longestStreak || 0}
          isPublicView={true}
        />
      )}
    </div>
  );
}
