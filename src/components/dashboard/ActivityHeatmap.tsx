import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserActivity } from '@/types';
import { Flame } from 'lucide-react';

interface ActivityHeatmapProps {
  activity: UserActivity[];
  currentStreak: number;
  longestStreak: number;
}

export function ActivityHeatmap({ activity, currentStreak, longestStreak }: ActivityHeatmapProps) {
  // Generate a map of dateKey -> problemsCompleted for fast lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activity.forEach(a => {
      map.set(a.dateKey, a.problemsCompleted);
    });
    return map;
  }, [activity]);

  const { weeks, totalDays } = useMemo(() => {
    // We want approximately the last 12 months (52 weeks)
    // We will start from the Sunday of 51 weeks ago
    const today = new Date();
    
    // To keep the layout predictable, let's align to weeks
    const currentDayOfWeek = today.getDay(); // 0 is Sunday
    
    const startDate = new Date(today);
    // Go back 51 full weeks plus current day of week to get to a Sunday
    startDate.setDate(today.getDate() - (51 * 7) - currentDayOfWeek);
    
    const weeksList: { dateKey: string; date: Date; intensity: number; count: number }[][] = [];
    
    let current = new Date(startDate);
    
    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        
        // If the date is in the future relative to today, we just render an empty cell but visually distinct (or just empty)
        // Actually, we should just stop if it's past today, but for a strict grid, we include them with 0 intensity
        const count = activityMap.get(dateKey) || 0;
        let intensity = 0;
        if (count === 1) intensity = 1;
        else if (count >= 2 && count <= 3) intensity = 2;
        else if (count >= 4) intensity = 3;
        
        week.push({ dateKey, date: new Date(current), intensity, count });
        
        current.setDate(current.getDate() + 1);
      }
      weeksList.push(week);
    }
    
    return { weeks: weeksList, totalDays: 52 * 7 };
  }, [activityMap]);

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1: return 'bg-primary/30';
      case 2: return 'bg-primary/60';
      case 3: return 'bg-primary';
      default: return 'bg-muted/60 dark:bg-muted/40';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Consistency</CardTitle>
            <CardDescription>Your daily problem solving activity</CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{currentStreak}</span>
              </div>
              <span className="text-xs text-muted-foreground">Current Streak</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-foreground">
                <span className="font-bold">{longestStreak}</span>
              </div>
              <span className="text-xs text-muted-foreground">Longest Streak</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow flex items-center justify-center overflow-hidden">
        <div className="flex items-end gap-2 overflow-x-auto pb-4 w-full justify-start md:justify-center">
          <div className="flex flex-col justify-between text-xs text-muted-foreground h-[116px] py-1 select-none pr-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex justify-start gap-[4px] min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="flex flex-col gap-[4px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`day-${weekIndex}-${dayIndex}`}
                    title={`${day.date.toLocaleDateString()}: ${day.count} problems`}
                    className={`h-[12px] w-[12px] rounded-[2px] transition-colors hover:ring-1 hover:ring-foreground/30 hover:z-10 cursor-help ${getIntensityColor(day.intensity)} ${day.date > new Date() ? 'opacity-20' : ''}`}
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
