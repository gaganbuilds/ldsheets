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
      <Card className="bg-[#141414] border-[#2A2A2A] p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm font-medium text-white/90">
            DSA Progress
          </div>
          <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs cursor-help">
            i
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Circular Progress Placeholder */}
          <div className="relative shrink-0 w-24 h-24 rounded-full flex items-center justify-center bg-[#0A0A0A] border-[4px] border-white/5">
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
              <span className="text-2xl font-bold text-white leading-none">{totalCompleted}</span>
              <div className="h-[1px] w-8 bg-white/20 my-1" />
              <span className="text-xs text-white/60 leading-none">{totalProblems}</span>
            </div>
          </div>

          {/* Difficulty Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-white/60">Easy</span>
              </div>
              <span className="text-white/80">{easyCompleted}/{easyTotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-white/60">Medium</span>
              </div>
              <span className="text-white/80">{mediumCompleted}/{mediumTotal}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-white/60">Hard</span>
              </div>
              <span className="text-white/80">{hardCompleted}/{hardTotal}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar + Roadmap (Visual Only) */}
      <Card className="bg-[#141414] border-[#2A2A2A] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm font-medium text-white/80">
          Calendar + Roadmap
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>

      {/* Motivational Quote */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-[#2A2A2A] p-6 lg:aspect-[4/5] min-h-[160px] flex flex-col justify-center text-center">
        <div className="absolute top-4 left-4 opacity-10">
          <Quote className="h-16 w-16 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-xl font-bold text-white/90 leading-tight">
            "Consistency is what transforms average into excellence."
          </p>
          <div className="flex justify-center">
             <span className="inline-block bg-white text-black px-2 py-0.5 font-bold text-sm transform -rotate-2">
               Keep coding
             </span>
          </div>
          <p className="text-sm text-white/40 italic mt-4">- CodeDepth</p>
        </div>
      </Card>

      {/* Sessions (Visual Only) */}
      <Card className="bg-[#141414] border-[#2A2A2A] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm font-medium text-white/80">
          Sessions
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>

      {/* Daily Planner (Visual Only) */}
      <Card className="bg-[#141414] border-[#2A2A2A] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity cursor-not-allowed">
        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm font-medium text-white/80">
          Daily Planner
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Lock className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}
