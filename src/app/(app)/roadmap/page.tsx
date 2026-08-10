'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Activity, Target, Search, Map } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export default function RoadmapPage() {
  const { profile } = useAuth();
  
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setError(null);
        const [fetchedRoadmaps, fetchedTopics, fetchedProblems] = await Promise.all([
          getRoadmaps(),
          getTopics(),
          getProblems(),
        ]);
        
        const activeRoadmaps = fetchedRoadmaps.filter(r => r.isActive);
        setAllRoadmaps(activeRoadmaps);
        setAllTopics(fetchedTopics.filter(t => t.isActive));
        setAllProblems(fetchedProblems.filter(p => p.isActive));
        
        if (activeRoadmaps.length > 0) {
          // Default to DSA roadmap, or the first active one
          const dsaRoadmap = activeRoadmaps.find(
            r => r.slug.toLowerCase().includes('dsa') || r.title.toLowerCase().includes('dsa')
          ) || activeRoadmaps[0];
          
          setSelectedRoadmapId(dsaRoadmap.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap data:", err);
        setError("Failed to load roadmaps. Please try again.");
        setIsLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchUserDataForRoadmap() {
      if (!selectedRoadmapId || !profile?.uid) {
        if (selectedRoadmapId) setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const roadmapProblems = allProblems.filter(p => p.roadmapId === selectedRoadmapId);
        
        const [userProgress, userNotes] = await Promise.all([
          getUserRoadmapProgress(profile.uid, selectedRoadmapId),
          getProblemNotes(profile.uid, roadmapProblems.map(p => p.id))
        ]);
        
        setProgress(userProgress);
        setNotes(userNotes);
      } catch (err) {
        console.error("Failed to fetch user data for roadmap:", err);
        // Don't show hard error for user data, just log it
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserDataForRoadmap();
  }, [selectedRoadmapId, profile?.uid, allProblems]);

  const roadmap = useMemo(() => allRoadmaps.find(r => r.id === selectedRoadmapId) || null, [allRoadmaps, selectedRoadmapId]);
  const topics = useMemo(() => allTopics.filter(t => t.roadmapId === selectedRoadmapId).sort((a,b) => a.displayOrder - b.displayOrder), [allTopics, selectedRoadmapId]);
  const problems = useMemo(() => allProblems.filter(p => p.roadmapId === selectedRoadmapId).sort((a,b) => a.displayOrder - b.displayOrder), [allProblems, selectedRoadmapId]);

  if (isLoading && allRoadmaps.length === 0) {
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
        title="Error Loading Roadmaps"
        description={error}
        icon={<Activity className="text-red-500" />}
        action={<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>}
      />
    );
  }

  if (allRoadmaps.length === 0) {
    return (
      <EmptyState 
        title="No Roadmaps Available"
        description="There are currently no active roadmaps. Please check back later."
        icon={<Target className="text-muted-foreground" />}
        action={<Button render={<Link href="/dashboard" />} variant="outline">Back to Dashboard</Button>}
      />
    );
  }

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

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Map;
    return <Icon className={className} />;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-10 pb-10 w-full max-w-[1600px] px-2 sm:px-4 lg:px-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        
        {/* Roadmap Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Choose your roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allRoadmaps.map((r) => {
              const isSelected = r.id === selectedRoadmapId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoadmapId(r.id)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 overflow-hidden group",
                    isSelected 
                      ? "bg-primary/5 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.15)] ring-1 ring-primary/20" 
                      : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg shrink-0 transition-colors",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
                  )}>
                    {renderIcon(r.icon || 'Map', "w-6 h-6")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-semibold text-sm truncate",
                      isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                    )}>
                      {r.title}
                    </h3>
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-[20px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-12 mb-8">
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

        {roadmap && (
          <SectionHeader 
            title={roadmap.title}
            description={roadmap.description}
          />
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !roadmap ? (
           <EmptyState 
             title="Roadmap Not Found"
             description="The selected roadmap could not be loaded."
           />
        ) : (
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
        )}
      </div>

      {/* Right Sidebar Area */}
      <div className="w-full xl:w-[320px] shrink-0">
        <RightSidebar problems={problems} progress={progress} />
      </div>
    </div>
  );
}
