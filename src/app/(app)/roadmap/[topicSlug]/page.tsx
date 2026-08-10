'use client';

import { useEffect, useState, useMemo } from 'react';
import { getTopicBySlug } from '@/lib/firebase/topics';
import { getProblems } from '@/lib/firebase/problems';
import { getUserProblemProgress } from '@/lib/firebase/progress';
import { getProblemNotes } from '@/lib/firebase/notes';
import { Topic, Problem, UserProgress, UserNote } from '@/types';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { ProblemRow } from '@/components/roadmap/ProblemRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function TopicDetailPage() {
  const params = useParams();
  const topicSlug = params.topicSlug as string;
  const { profile } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  useEffect(() => {
    async function fetchData() {
      if (!topicSlug) return;
      
      try {
        const foundTopic = await getTopicBySlug(topicSlug);
        if (foundTopic && foundTopic.isActive) {
          setTopic(foundTopic);
          
          const allProblems = await getProblems(foundTopic.id);
          const activeProblems = allProblems.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
          setProblems(activeProblems);
          
          if (profile?.uid) {
            const [userProgress, userNotes] = await Promise.all([
              getUserProblemProgress(profile.uid, foundTopic.id),
              getProblemNotes(profile.uid, activeProblems.map(p => p.id))
            ]);
            setProgress(userProgress);
            setNotes(userNotes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch topic data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [topicSlug, profile?.uid]);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      if (difficultyFilter !== 'All' && problem.difficulty !== difficultyFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = problem.title.toLowerCase().includes(query);
        const matchesTags = problem.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTags) return false;
      }
      return true;
    });
  }, [problems, searchQuery, difficultyFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-24 bg-muted/30 animate-pulse rounded-lg" />
        <div className="h-12 bg-muted/30 animate-pulse rounded-lg max-w-md" />
        <div className="space-y-4 mt-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 -ml-4" nativeButton={false} render={<Link href="/roadmap" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
        </Button>
        <EmptyState 
          title="Topic Not Found"
          description="The topic you are looking for does not exist or has been disabled."
          icon={<Target className="text-muted-foreground" />}
          action={<Button nativeButton={false} render={<Link href="/roadmap" />} variant="outline">Browse Roadmap</Button>}
        />
      </div>
    );
  }

  const completedInTopic = progress.filter(p => p.completed).length;
  const topicProgress = problems.length > 0 ? Math.round((completedInTopic / problems.length) * 100) : 0;
  
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

  const handleProgressChange = (updatedProgress: UserProgress) => {
    setProgress(prev => {
      const exists = prev.find(p => p.id === updatedProgress.id);
      if (exists) {
        return prev.map(p => p.id === updatedProgress.id ? updatedProgress : p);
      }
      return [...prev, updatedProgress];
    });
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <Button variant="ghost" className="mb-2 -ml-4" nativeButton={false} render={<Link href="/roadmap" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
        </Button>
        <SectionHeader 
          title={topic.title}
          description={topic.description || `Master ${topic.title} by solving these curated problems.`}
        />
      </div>
      
      {/* Topic Stats Bar */}
      <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
        <div className="flex gap-4 sm:gap-8 flex-wrap">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Problems</p>
            <p className="text-2xl font-bold">{problems.length}</p>
          </div>
          <div className="hidden sm:block w-px bg-border my-1" />
          <div className="flex gap-4">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Easy</p>
              <p className="text-lg font-semibold">{easyCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Medium</p>
              <p className="text-lg font-semibold">{mediumCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Hard</p>
              <p className="text-lg font-semibold">{hardCount}</p>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-64 space-y-2 self-center">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-bold">{topicProgress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${topicProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-2 rounded-lg min-w-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search problems or tags..." 
            className="pl-9 w-full bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex bg-background rounded-md border p-1 w-full sm:w-auto overflow-x-auto">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-1.5 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                difficultyFilter === diff 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <ProblemRow 
              key={problem.id} 
              problem={problem}
              userId={profile?.uid || ''}
              initialProgress={progress.find(p => p.problemId === problem.id)}
              initialNote={notes.find(n => n.problemId === problem.id)}
              onProgressChange={handleProgressChange}
            />
          ))
        ) : (
          <EmptyState 
            title="No problems found"
            description={searchQuery || difficultyFilter !== 'All' 
              ? "No problems match your current filters. Try adjusting your search."
              : "There are currently no problems added to this topic."}
            className="min-h-[150px] sm:min-h-[200px] lg:min-h-[250px]"
            action={(searchQuery || difficultyFilter !== 'All') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('All');
                }}
              >
                Clear Filters
              </Button>
            )}
          />
        )}
      </div>
    </div>
  );
}
