import React from 'react';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { Trophy, Flame, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface LeaderboardTableProps {
  users: UserProfile[];
  startIndex: number;
  currentUserId?: string;
}

export function LeaderboardTable({ users, startIndex, currentUserId }: LeaderboardTableProps) {
  if (!users || users.length === 0) return null;

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      {/* Mobile Card View (Hidden on sm and up) */}
      <div className="block sm:hidden divide-y">
        {users.map((user, index) => {
          const rank = startIndex + index + 1;
          const isCurrentUser = user.uid === currentUserId;
          
          return (
            <div key={user.uid} className={cn("p-4 flex items-center gap-3", isCurrentUser && "bg-primary/5")}>
              <div className="w-6 text-center font-bold text-muted-foreground">
                {rank}
              </div>
              
              <Link href={`/profile/${user.username}`}>
                <div className="w-10 h-10 rounded-full border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`} className="hover:underline">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    {isCurrentUser && <Badge variant="secondary" className="text-[10px] h-4 px-1">You</Badge>}
                  </div>
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>@{user.username}</span>
                  {user.currentStreak > 0 && (
                    <span className="flex items-center text-orange-500">
                      <Flame className="w-3 h-3 mr-0.5" />
                      {user.currentStreak}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-amber-500">{user.totalXP.toLocaleString()} XP</p>
                <p className="text-xs text-muted-foreground">Lvl {user.level || 1}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Total XP</TableHead>
              <TableHead className="text-right">Level</TableHead>
              <TableHead className="text-right">Problems</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => {
              const rank = startIndex + index + 1;
              const isCurrentUser = user.uid === currentUserId;
              
              return (
                <TableRow key={user.uid} className={cn(isCurrentUser && "bg-primary/5")}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {rank}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Link href={`/profile/${user.username}`}>
                        <div className="w-10 h-10 rounded-full border overflow-hidden bg-muted flex items-center justify-center shrink-0 transition-transform hover:scale-105">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex flex-col">
                        <Link href={`/profile/${user.username}`} className="hover:underline">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.name}</span>
                            {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{user.username}</span>
                          {user.currentStreak > 0 && (
                            <span className="flex items-center text-orange-500" title="Current Streak">
                              <Flame className="w-3.5 h-3.5 mr-1" />
                              {user.currentStreak}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right font-bold text-amber-500">
                    {user.totalXP.toLocaleString()}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {user.level || 1}
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {user.completedProblems || 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
