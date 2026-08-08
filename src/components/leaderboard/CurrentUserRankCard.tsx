import React from 'react';
import { UserProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CurrentUserRankCardProps {
  profile: UserProfile;
  rank: number | null;
  isVisibleInList: boolean;
}

export function CurrentUserRankCard({ profile, rank, isVisibleInList }: CurrentUserRankCardProps) {
  // If the user is currently shown in the table (or top three) or doesn't have a rank, we can hide this card
  // OR we can always show it as a sticky summary. The prompt says:
  // "If the current user is not visible on the current leaderboard page: Show a compact "Your Rank" section."
  if (isVisibleInList || rank === null) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 sm:static sm:px-0 sm:bottom-auto z-40 sm:z-auto mb-6">
      <Link href="/profile">
        <Card className="border-primary/20 bg-card/95 backdrop-blur shadow-lg overflow-hidden transition-all hover:border-primary/50 group">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                #{rank}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Your Rank</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-500">{profile.totalXP.toLocaleString()} XP</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">• {profile.completedProblems || 0} problems</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="text-sm mr-1 hidden sm:inline-block">View Profile</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
