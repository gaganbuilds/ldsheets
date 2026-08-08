"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getBadges, getUserBadges } from '@/lib/firebase/badges';
import { Badge, UserBadge } from '@/types';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { BadgeCard } from '@/components/dashboard/BadgeCard';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { Button } from '@/components/ui/button';
import { Activity, Award } from 'lucide-react';

export default function AchievementsPage() {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        
        const [allBadges, earnedBadges] = await Promise.all([
          getBadges(),
          profile?.uid ? getUserBadges(profile.uid) : Promise.resolve([]),
        ]);
        
        setBadges(allBadges.filter(b => b.isActive));
        setUserBadges(earnedBadges);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
        setError("Failed to load achievements. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [profile?.uid]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/30 animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-muted/30 animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <EmptyState 
          title="Error Loading Achievements"
          description={error}
          icon={<Activity className="text-red-500" />}
          action={<Button onClick={() => window.location.reload()} variant="outline">Retry</Button>}
        />
      </div>
    );
  }

  const unlockedCount = userBadges.length;
  const totalCount = badges.length;

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader 
        title="Your Achievements"
        description={`You have unlocked ${unlockedCount} out of ${totalCount} available badges.`}
      />
      
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {badges.map(badge => {
          const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
          return (
            <BadgeCard 
              key={badge.id}
              badge={badge}
              userBadge={userBadge}
            />
          );
        })}
      </div>
    </div>
  );
}
