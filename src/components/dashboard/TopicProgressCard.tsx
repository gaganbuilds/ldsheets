import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Topic } from '@/types';

interface TopicProgressCardProps {
  topic: Topic;
  totalProblems: number;
  completedProblems: number;
}

export function TopicProgressCard({ topic, totalProblems, completedProblems }: TopicProgressCardProps) {
  const percentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="font-semibold">{topic.title}</div>
          <div className="text-sm text-muted-foreground">{percentage}%</div>
        </div>
        
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          {completedProblems} / {totalProblems} problems
        </div>
      </CardContent>
    </Card>
  );
}
