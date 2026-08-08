import React from 'react';
import { UserProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, Trophy, Zap, LayoutDashboard } from 'lucide-react';

interface PublicProfileHeaderProps {
  profile: UserProfile;
}

export function PublicProfileHeader({ profile }: PublicProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-b from-muted/50 to-background">
      <div className="h-32 bg-primary/10"></div>
      <CardContent className="px-6 pb-8 relative pt-0">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-12 relative z-10">
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background bg-primary/10 flex items-center justify-center shrink-0 shadow-sm text-primary font-bold text-3xl sm:text-4xl">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span>
                {profile.name 
                  ? profile.name.trim().split(/\s+/).length === 1 
                    ? profile.name.substring(0, 2).toUpperCase() 
                    : (profile.name.trim().split(/\s+/)[0][0] + profile.name.trim().split(/\s+/)[profile.name.trim().split(/\s+/).length - 1][0]).toUpperCase()
                  : 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-2 mb-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
              {profile.username && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
            </div>
            
            {profile.bio && (
              <p className="max-w-2xl text-sm leading-relaxed">{profile.bio}</p>
            )}
          </div>
          
        </div>
        
        <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t">
          <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-muted/50 rounded-lg">
            <LayoutDashboard className="w-4 h-4 text-purple-500" />
            <span>Level {profile.level || 1}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-muted/50 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{profile.totalXP || 0} XP</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-muted/50 rounded-lg">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>{profile.currentStreak || 0} Day Streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
