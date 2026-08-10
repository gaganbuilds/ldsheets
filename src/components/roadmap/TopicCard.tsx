import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Topic, Problem, UserProgress, UserNote } from '@/types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { ProblemRow } from './ProblemRow';
import { cn } from '@/lib/utils';


interface TopicCardProps {
  topic: Topic;
  totalProblems: number;
  completedProblems: number;
  problems: Problem[];
  progress: UserProgress[];
  notes: UserNote[];
  userId: string;
  onProgressChange: (progress: UserProgress) => void;
}

export function TopicCard({ 
  topic, 
  totalProblems, 
  completedProblems,
  problems,
  progress,
  notes,
  userId,
  onProgressChange
}: TopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="space-y-1 mb-2 px-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{topic.title}</h2>
        {topic.description && (
          <p className="text-sm text-muted-foreground">{topic.description}</p>
        )}
      </div>

      <Card 
        className={cn(
          "transition-all overflow-hidden border-border bg-card", 
          isExpanded ? "border-l-2 border-l-green-500" : ""
        )}
      >
        {/* Header (Click to expand) */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-green-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            )}
            <h3 className="font-semibold text-base sm:text-lg text-foreground/90">{topic.title} Problems</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">{completedProblems}/{totalProblems}</span>
            <div className="h-1.5 w-16 sm:w-24 bg-secondary rounded-full overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              {problems.length > 0 ? (
                problems.map((problem) => (
                  <ProblemRow 
                    key={problem.id}
                    problem={problem}
                    userId={userId}
                    initialProgress={progress.find(p => p.problemId === problem.id)}
                    initialNote={notes.find(n => n.problemId === problem.id)}
                    onProgressChange={onProgressChange}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm border border-border/50 rounded-lg bg-muted">
                  No problems match your current filters in this topic.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
