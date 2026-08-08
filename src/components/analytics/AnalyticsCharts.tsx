import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleBarChartProps {
  data: { label: string; value: number }[];
  title: string;
  colorClass?: string;
  height?: string;
}

export function SimpleBarChart({ 
  data, 
  title, 
  colorClass = "bg-primary",
  height = "h-40"
}: SimpleBarChartProps) {
  
  if (data.length === 0) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid div by 0

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-end gap-1 sm:gap-2 overflow-x-auto pb-2">
        {data.map((item, i) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[16px] sm:min-w-[20px] gap-2 group">
              <div className={`w-full relative flex items-end justify-center rounded-t-sm bg-muted/20 ${height}`}>
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 ${colorClass} group-hover:opacity-80`}
                  style={{ height: `${percentage}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface DifficultyProgressProps {
  stats: {
    Easy: { completed: number; total: number };
    Medium: { completed: number; total: number };
    Hard: { completed: number; total: number };
  };
}

export function DifficultyProgress({ stats }: DifficultyProgressProps) {
  const difficulties = [
    { name: 'Easy', data: stats.Easy, color: 'bg-green-500' },
    { name: 'Medium', data: stats.Medium, color: 'bg-amber-500' },
    { name: 'Hard', data: stats.Hard, color: 'bg-red-500' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Difficulty Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {difficulties.map(diff => {
          const percent = diff.data.total > 0 ? Math.round((diff.data.completed / diff.data.total) * 100) : 0;
          return (
            <div key={diff.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{diff.name}</span>
                <span className="text-muted-foreground">{diff.data.completed} <span className="text-xs">/ {diff.data.total}</span></span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${diff.color} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
