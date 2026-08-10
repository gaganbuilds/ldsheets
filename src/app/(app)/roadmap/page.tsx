'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserRoadmapProgress } from '@/lib/firebase/progress';
import { getProblemNotes } from '@/lib/firebase/notes';
import { Roadmap, Topic, Problem, UserProgress, UserNote } from '@/types';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { TopicCard } from '@/components/roadmap/TopicCard';
import { RightSidebar } from '@/components/roadmap/RightSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Target, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const { profile } = useAuth();
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

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
            const activeProblemsList = allProblems.filter(p => p.isActive && p.roadmapId === dsaRoadmap.id);
            const [userProgress, userNotes] = await Promise.all([
              getUserRoadmapProgress(profile.uid, dsaRoadmap.id),
              getProblemNotes(profile.uid, activeProblemsList.map(p => p.id))
            ]);
            setProgress(userProgress);
            setNotes(userNotes);
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

  const handleProgressChange = (updatedProgress: UserProgress) => {
    setProgress(prev => {
      const exists = prev.find(p => p.id === updatedProgress.id);
      if (exists) {
        return prev.map(p => p.id === updatedProgress.id ? updatedProgress : p);
      }
      return [...prev, updatedProgress];
    });
  };

  const filteredProblems = problems.filter(problem => {
    if (difficultyFilter !== 'All' && problem.difficulty !== difficultyFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = problem.title.toLowerCase().includes(query);
      const matchesTags = problem.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesTags) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-10 pb-10 w-full max-w-[1600px] px-2 sm:px-4 lg:px-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search problems..." 
            className="pl-9 w-full bg-background border-border focus-visible:ring-1 focus-visible:ring-primary text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-muted rounded-md border border-border/50 p-1 w-full sm:w-auto overflow-x-auto">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-sm transition-all whitespace-nowrap text-center",
                  difficultyFilter === diff 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                )}
              >
                {diff === 'All' ? 'Difficulty' : diff}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex bg-muted rounded-md border border-border/50 p-1">
             <button className="px-4 py-1.5 text-[13px] font-medium rounded-sm whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors">
               Topic
             </button>
          </div>
        </div>
      </div>

      <SectionHeader 
        title={roadmap.title}
        description={roadmap.description}
      />

      <div className="space-y-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground/90">Topics ({topics.length})</h3>
        
        {topics.length > 0 ? (
          <div className="flex flex-col">
            {topics.map(topic => {
              const allTopicProblems = problems.filter(p => p.topicId === topic.id);
              const topicFilteredProblems = filteredProblems.filter(p => p.topicId === topic.id);
              const completedInTopic = progress.filter(p => p.topicId === topic.id && p.completed).length; 
              
              if (topicFilteredProblems.length === 0 && (searchQuery || difficultyFilter !== 'All')) {
                return null;
              }

              return (
                <TopicCard 
                  key={topic.id}
                  topic={topic}
                  totalProblems={allTopicProblems.length}
                  completedProblems={completedInTopic}
                  problems={topicFilteredProblems}
                  progress={progress}
                  notes={notes}
                  userId={profile?.uid || ''}
                  onProgressChange={handleProgressChange}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="No Topics Available"
            description="There are currently no active topics in this roadmap."
            className="min-h-[150px] sm:min-h-[200px] lg:min-h-[250px]"
          />
        )}
      </div>
      </div>

      {/* Right Sidebar Area */}
      <div className="w-full xl:w-[320px] shrink-0">
        <RightSidebar problems={problems} progress={progress} />
      </div>
    </div>
  );
}
