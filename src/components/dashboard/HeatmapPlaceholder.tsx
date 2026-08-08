import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function HeatmapPlaceholder() {
  // Generate an empty grid for the last 15 weeks
  const weeks = Array.from({ length: 15 });
  const days = Array.from({ length: 7 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Your daily problem solving activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 overflow-x-auto pb-4">
          <div className="flex flex-col justify-between text-xs text-muted-foreground h-[116px] py-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex justify-start gap-1 flex-1 min-w-[200px]">
            {weeks.map((_, weekIndex) => (
              <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                {days.map((_, dayIndex) => (
                  <div
                    key={`day-${weekIndex}-${dayIndex}`}
                    className="h-[14px] w-[14px] rounded-[2px] bg-muted/60 dark:bg-muted/40"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
