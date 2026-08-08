import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Topic } from '@/types';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  totalProblems: number;
  completedProblems: number;
}

export function TopicCard({ topic, totalProblems, completedProblems }: TopicCardProps) {
  const percentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

  return (
    <Link href={`/roadmap/${topic.slug}`} className="block group">
      <Card className="transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2 w-full min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{topic.title}</h3>
            {topic.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{topic.description}</p>
            )}
            
            <div className="flex items-center gap-3 pt-1">
              <div className="h-1.5 flex-1 max-w-[200px] bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{percentage}% Complete</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline-block">• {totalProblems} Problems</span>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
