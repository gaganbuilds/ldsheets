"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLeaderboardPage, getCurrentUserRank, LeaderboardPageResult } from '@/lib/firebase/leaderboard';
import { UserProfile } from '@/types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

import { LeaderboardTopThree } from '@/components/leaderboard/LeaderboardTopThree';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { CurrentUserRankCard } from '@/components/leaderboard/CurrentUserRankCard';
import { SearchInput } from '@/components/ui-custom/SearchInput';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX } from 'lucide-react';

const PAGE_SIZE = 25;

export default function LeaderboardPage() {
  const { profile } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Fetch initial leaderboard
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        const result = await getLeaderboardPage(PAGE_SIZE, null, searchQuery);
        setUsers(result.users);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Debounce search
    const timer = setTimeout(() => {
      loadInitial();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch current user rank (once)
  useEffect(() => {
    async function fetchRank() {
      if (profile?.uid && profile.totalXP > 0) {
        const rank = await getCurrentUserRank(profile.totalXP, profile.completedProblems || 0, profile.uid);
        setCurrentUserRank(rank);
      }
    }
    fetchRank();
  }, [profile?.uid, profile?.totalXP, profile?.completedProblems]);

  const handleLoadMore = async () => {
    if (!lastDoc || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const result = await getLeaderboardPage(PAGE_SIZE, lastDoc, searchQuery);
      setUsers(prev => [...prev, ...result.users]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const isUserVisible = users.some(u => u.uid === profile?.uid);

  // Top three logic: only show if we aren't searching
  const showTopThree = !searchQuery && users.length > 0;
  const topThree = showTopThree ? users.slice(0, 3) : [];
  const remainingUsers = showTopThree ? users.slice(3) : users;
  const startIndex = showTopThree ? 3 : 0;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center pt-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Rankings based on total XP earned.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <SearchInput 
            placeholder="Search by username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {profile && (
        <CurrentUserRankCard 
          profile={profile} 
          rank={currentUserRank} 
          isVisibleInList={isUserVisible} 
        />
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center bg-muted/20 rounded-xl border border-dashed">
          <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {showTopThree && <LeaderboardTopThree topUsers={topThree} />}
          
          <LeaderboardTable 
            users={remainingUsers} 
            startIndex={startIndex} 
            currentUserId={profile?.uid} 
          />
          
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
