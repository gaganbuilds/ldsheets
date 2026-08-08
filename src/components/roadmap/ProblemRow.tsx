import React, { useState, useEffect } from 'react';
import { Problem, UserProgress, UserNote } from '@/types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, Check, X, FileText, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { markProblemComplete, markProblemIncomplete } from '@/lib/firebase/progress';
import { saveProblemNote } from '@/lib/firebase/notes';

interface ProblemRowProps {
  problem: Problem;
  userId: string;
  initialProgress?: UserProgress;
  initialNote?: UserNote;
  onProgressChange?: (progress: UserProgress) => void;
}

export function ProblemRow({ problem, userId, initialProgress, initialNote, onProgressChange }: ProblemRowProps) {
  const [progress, setProgress] = useState<UserProgress | undefined>(initialProgress);
  const [note, setNote] = useState<UserNote | undefined>(initialNote);
  const [noteContent, setNoteContent] = useState(initialNote?.content || '');
  
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Sync state if props change
  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    setNote(initialNote);
    setNoteContent(initialNote?.content || '');
  }, [initialNote]);

  const isCompleted = progress?.completed || false;

  const handleToggleComplete = async () => {
    if (!userId) return;
    setIsUpdatingProgress(true);
    try {
      if (isCompleted && progress) {
        await markProblemIncomplete(progress.id, userId);
        const updated = { ...progress, completed: false, completedAt: null };
        setProgress(updated);
        onProgressChange?.(updated);
        toast.info("Problem marked incomplete", {
          description: "Keep practicing!",
        });
      } else {
        const { progressId, xpAwarded } = await markProblemComplete(
          userId, 
          problem.id, 
          problem.roadmapId, 
          problem.topicId, 
          problem.difficulty,
          progress?.id
        );
        const updated: UserProgress = {
          id: progressId,
          userId,
          problemId: problem.id,
          roadmapId: problem.roadmapId,
          topicId: problem.topicId,
          completed: true,
          completedAt: new Date(),
          createdAt: progress?.createdAt || new Date(),
          updatedAt: new Date()
        };
        setProgress(updated);
        onProgressChange?.(updated);
        
        if (xpAwarded > 0) {
          toast.success("Problem completed! 🎉", {
            description: `Great job! You earned +${xpAwarded} XP.`,
          });
        } else {
          toast.success("Problem completed!", {
            description: "Your progress is saved.",
          });
        }
        
        // Evaluate badges after meaningful activity
        const { evaluateUserBadges } = await import('@/lib/badgeEngine');
        const unlockedBadges = await evaluateUserBadges(userId);
        
        if (unlockedBadges.length > 0) {
          unlockedBadges.forEach(({ badge, userBadge }) => {
            setTimeout(() => {
              toast.success(`Badge Unlocked: ${badge.name}! 🏆`, {
                description: badge.xpReward > 0 ? `You earned +${badge.xpReward} XP.` : badge.description,
                duration: 5000,
              });
            }, 500); // Slight delay so it doesn't overlap identically with the problem toast
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating progress", {
        description: "Please try again later.",
      });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSaveNote = async () => {
    if (!userId) return;
    setIsSavingNote(true);
    try {
      const newId = await saveProblemNote(userId, problem.id, noteContent, note?.id);
      setNote({
        id: newId,
        userId,
        problemId: problem.id,
        content: noteContent,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date()
      });
      toast.success("Note saved", {
        description: "Your personal note has been securely saved.",
      });
      setIsNotesOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error saving note", {
        description: "We couldn't save your note. Please try again.",
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  const difficultyColors = {
    Easy: 'text-green-500 bg-green-500/10 border-green-500/20',
    Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Hard: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className={cn("flex flex-col bg-card border rounded-lg transition-all hover:border-primary/30 hover:shadow-sm", isCompleted && "bg-muted/10")}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          
          <button 
            onClick={handleToggleComplete}
            disabled={isUpdatingProgress}
            className={cn(
              "shrink-0 mt-1 sm:mt-0 flex items-center justify-center h-6 w-6 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-transparent border-input hover:bg-accent hover:text-accent-foreground",
              isUpdatingProgress && "opacity-50 cursor-not-allowed"
            )}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isUpdatingProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isCompleted ? (
              <Check className="h-4 w-4" />
            ) : null}
          </button>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h4 className={cn("font-medium text-base truncate", isCompleted && "text-muted-foreground line-through")}>
                {problem.title}
              </h4>
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full border", 
                difficultyColors[problem.difficulty]
              )}>
                {problem.difficulty}
              </span>
              {problem.platform && (
                <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                  {problem.platform}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {problem.estimatedTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {problem.estimatedTime} min
                </span>
              )}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {problem.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="opacity-80">#{tag}</span>
                  ))}
                  {problem.tags.length > 3 && <span className="opacity-80">+{problem.tags.length - 3}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className={cn("flex-1 sm:flex-none", note?.content ? "text-primary" : "text-muted-foreground")}
          >
            <FileText className="mr-2 h-4 w-4" />
            {note?.content ? 'Edit Notes' : 'Add Notes'}
          </Button>

          {problem.externalURL ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none w-full sm:w-auto hover:bg-primary hover:text-primary-foreground"
              render={<a href={problem.externalURL} target="_blank" rel="noopener noreferrer" />}
            >
              Solve Problem <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled className="flex-1 sm:flex-none w-full sm:w-auto text-muted-foreground">
              Unavailable
            </Button>
          )}
        </div>
      </div>

      {isNotesOpen && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/5 rounded-b-lg animate-in slide-in-from-top-2">
          <div className="space-y-3">
            <h5 className="text-sm font-medium">Personal Notes</h5>
            <Textarea 
              placeholder="Write your notes here... (e.g. key insights, time complexities, alternative approaches)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[100px] bg-background"
              maxLength={5000}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                setNoteContent(note?.content || '');
                setIsNotesOpen(false);
              }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNote} disabled={isSavingNote}>
                {isSavingNote ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Note</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
