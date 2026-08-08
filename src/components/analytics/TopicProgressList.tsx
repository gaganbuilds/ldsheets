import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopicProgressListProps {
  topicProgress: {
    topic: { title: string; id: string };
    completed: number;
    total: number;
    percentage: number;
  }[];
}

export function TopicProgressList({ topicProgress }: TopicProgressListProps) {
  if (topicProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Topic Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active topics found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Topic Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicProgress.map((tp) => (
            <div key={tp.topic.id} className="space-y-2">
              <div className="flex justify-between items-baseline text-sm">
                <span className="font-semibold truncate pr-2">{tp.topic.title}</span>
                <span className="text-muted-foreground shrink-0">{tp.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${tp.percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {tp.completed} / {tp.total} completed
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
