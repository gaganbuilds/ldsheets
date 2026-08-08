'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress } from '@/lib/firebase/progress';
import { Roadmap, Topic, Problem, UserProgress } from '@/types';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { TopicCard } from '@/components/roadmap/TopicCard';
import { Button } from '@/components/ui/button';
import { Activity, Target } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage() {
  const { profile } = useAuth();
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        // We need all roadmaps to find the DSA one
        const [allRoadmaps, allTopics, allProblems] = await Promise.all([
          getRoadmaps(),
          getTopics(),
          getProblems(),
        ]);
        
        // Find the DSA roadmap (either by slug or title)
        const dsaRoadmap = allRoadmaps.find(
          r => r.isActive && (r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa'))
        ) || allRoadmaps.find(r => r.isActive); // Fallback to first active if no explicit "dsa" found

        if (dsaRoadmap) {
          setRoadmap(dsaRoadmap);
          setTopics(allTopics.filter(t => t.isActive && t.roadmapId === dsaRoadmap.id));
          setProblems(allProblems.filter(p => p.isActive && p.roadmapId === dsaRoadmap.id));
          
          if (profile?.uid) {
            const userProgress = await getUserRoadmapProgress(profile.uid, dsaRoadmap.id);
            setProgress(userProgress);
          }
        }
      } catch (err) {
        console.error("Failed to fetch roadmap data:", err);
        setError("Failed to load roadmap. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [profile?.uid]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-muted/30 animate-pulse rounded-lg" />
        <div className="space-y-4 mt-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        title="Error Loading Roadmap"
        description={error}
        icon={<Activity className="text-red-500" />}
        action={<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>}
      />
    );
  }

  if (!roadmap) {
    return (
      <EmptyState 
        title="No Roadmap Available"
        description="We couldn't find an active DSA roadmap. Please check back later."
        icon={<Target className="text-muted-foreground" />}
        action={<Button render={<Link href="/dashboard" />} variant="outline">Back to Dashboard</Button>}
      />
    );
  }

  const completedProblemsCount = progress.filter(p => p.completed).length;
  const totalProblemsCount = problems.length;
  const overallProgress = totalProblemsCount > 0 ? Math.round((completedProblemsCount / totalProblemsCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <SectionHeader 
        title={roadmap.title}
        description={roadmap.description}
      />
      
      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1 space-y-2 text-center md:text-left w-full">
          <h3 className="font-semibold text-lg tracking-tight">Overall Progress</h3>
          <p className="text-sm text-muted-foreground">
            {completedProblemsCount} of {totalProblemsCount} problems completed
          </p>
        </div>
        
        <div className="w-full md:w-1/2 flex items-center gap-4">
          <div className="h-3 flex-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="font-bold text-lg">{overallProgress}%</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold tracking-tight">Topics ({topics.length})</h3>
        
        {topics.length > 0 ? (
          <div className="flex flex-col gap-4">
            {topics.map(topic => {
              const topicProblems = problems.filter(p => p.topicId === topic.id);
              const completedInTopic = progress.filter(p => p.topicId === topic.id && p.completed).length; 
              
              return (
                <TopicCard 
                  key={topic.id}
                  topic={topic}
                  totalProblems={topicProblems.length}
                  completedProblems={completedInTopic}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="No Topics Available"
            description="There are currently no active topics in this roadmap."
            className="min-h-[250px]"
          />
        )}
      </div>
    </div>
  );
}
