import React from 'react';
import { Problem, UserProgress } from '@/types';
import { Card } from '@/components/ui/card';
import { Lock, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  problems: Problem[];
  progress: UserProgress[];
}

export function RightSidebar({ problems, progress }: RightSidebarProps) {
  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.problemId));

  const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumTotal = problems.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;

  const easyCompleted = problems.filter(p => p.difficulty === 'Easy' && completedIds.has(p.id)).length;
  const mediumCompleted = problems.filter(p => p.difficulty === 'Medium' && completedIds.has(p.id)).length;
  const hardCompleted = problems.filter(p => p.difficulty === 'Hard' && completedIds.has(p.id)).length;

  const totalCompleted = completedIds.size;
  const totalProblems = problems.length;
  
  // To simulate the circular progress visual, we can use an SVG or a simple conic-gradient.
  const percentage = totalProblems > 0 ? (totalCompleted / totalProblems) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* DSA Progress */}
      <Card className="bg-card border-border p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="px-3 py-1 bg-muted border border-border/50 rounded text-sm font-medium text-foreground">
            DSA Progress
          </div>
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs cursor-help">
            i
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Circular Progress Placeholder */}
          <div className="relative shrink-0 w-24 h-24 rounded-full flex items-center justify-center bg-background border-[4px] border-border/50">
            {/* Fake progress arc */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="46" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="8" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (289 * percentage) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10 text-center">
              <span className="text-2xl font-bold text-foreground leading-none">{totalCompleted}</span>
              <div className="h-[1px] w-8 bg-border my-1" />
              <span className="text-xs text-muted-foreground leading-none">{totalProblems}</span>
            </div>
          </div>

          {/* Difficulty Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Easy</span>
              </div>
              <span className="text-foreground/80">{easyCompleted}/{easyTotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Medium</span>
              </div>
              <span className="text-foreground/80">{mediumCompleted}/{mediumTotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Hard</span>
              </div>
              <span className="text-foreground/80">{hardCompleted}/{hardTotal}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar + Roadmap (Visual Only) */}
      <Card className="bg-card border-border p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-muted border border-border/50 rounded text-sm font-medium text-foreground/80">
          Calendar + Roadmap
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>

      {/* Motivational Quote */}
      <Card className="relative overflow-hidden bg-card border-border shadow-sm p-6 lg:aspect-[4/5] min-h-[160px] flex flex-col justify-center text-center">
        <div className="absolute top-4 left-4 opacity-5 dark:opacity-10">
          <Quote className="h-16 w-16 text-foreground" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-xl font-bold text-foreground/90 leading-tight">
            "Consistency is what transforms average into excellence."
          </p>
          <div className="flex justify-center">
             <span className="inline-block bg-primary text-primary-foreground dark:bg-white dark:text-black px-2 py-0.5 font-bold text-sm transform -rotate-2">
               Keep coding
             </span>
          </div>
          <p className="text-sm text-muted-foreground italic mt-4">- CodeDepth</p>
        </div>
      </Card>

      {/* Sessions (Visual Only) */}
      <Card className="bg-card border-border p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-muted border border-border/50 rounded text-sm font-medium text-foreground/80">
          Sessions
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>

      {/* Daily Planner (Visual Only) */}
      <Card className="bg-card border-border p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-muted border border-border/50 rounded text-sm font-medium text-foreground/80">
          Daily Planner
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}
