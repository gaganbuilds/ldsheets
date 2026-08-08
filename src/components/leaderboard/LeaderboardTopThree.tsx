import React from 'react';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { Trophy, Flame, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardTopThreeProps {
  topUsers: UserProfile[];
}

export function LeaderboardTopThree({ topUsers }: LeaderboardTopThreeProps) {
  if (!topUsers || topUsers.length === 0) return null;

  // Render a podium spot
  const renderSpot = (user: UserProfile | undefined, rank: number) => {
    if (!user) return <div className="flex-1" key={`empty-${rank}`} />;
    
    let heightClass = "h-32 sm:h-40";
    let trophyColor = "text-yellow-500";
    let bgClass = "bg-yellow-500/10 border-yellow-500/20";
    
    if (rank === 2) {
      heightClass = "h-24 sm:h-32";
      trophyColor = "text-slate-400";
      bgClass = "bg-slate-400/10 border-slate-400/20";
    } else if (rank === 3) {
      heightClass = "h-20 sm:h-28";
      trophyColor = "text-amber-600";
      bgClass = "bg-amber-600/10 border-amber-600/20";
    }
    
    return (
      <div key={user.uid} className="flex flex-col items-center flex-1 z-10 px-1 sm:px-4">
        <Link href={`/profile/${user.username}`}>
          <div className="relative group cursor-pointer mb-4 flex flex-col items-center">
            
            <div className="absolute -top-5 z-20">
              <Trophy className={cn("w-6 h-6 sm:w-8 sm:h-8", trophyColor)} fill="currentColor" />
            </div>
            
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 overflow-hidden mb-2 bg-muted flex items-center justify-center transition-transform group-hover:scale-105",
              rank === 1 ? "border-yellow-500 w-20 h-20 sm:w-24 sm:h-24" : 
              rank === 2 ? "border-slate-400" : "border-amber-600"
            )}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="text-center">
              <p className="font-bold text-sm sm:text-base truncate w-24 sm:w-32">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate w-24 sm:w-32">@{user.username}</p>
            </div>
          </div>
        </Link>
        
        <div className={cn("w-full rounded-t-lg border-t border-x flex flex-col items-center justify-start pt-4 relative overflow-hidden", heightClass, bgClass)}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <span className="text-2xl sm:text-4xl font-black opacity-20 relative z-10">{rank}</span>
          <div className="relative z-10 flex flex-col items-center mt-2">
            <span className="font-bold text-sm sm:text-base">{user.totalXP.toLocaleString()} XP</span>
            <span className="text-xs text-muted-foreground">Lvl {user.level || 1}</span>
          </div>
        </div>
      </div>
    );
  };

  // Reorder for Podium: 2nd, 1st, 3rd
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 pb-8 flex items-end justify-center max-w-3xl mx-auto pt-8">
        {renderSpot(topUsers[1], 2)}
        {renderSpot(topUsers[0], 1)}
        {renderSpot(topUsers[2], 3)}
      </CardContent>
    </Card>
  );
}
