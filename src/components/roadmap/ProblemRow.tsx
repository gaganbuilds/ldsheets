import React, { useState, useEffect } from 'react';
import { Problem, UserProgress, UserNote } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { markProblemComplete, markProblemIncomplete } from '@/lib/firebase/progress';
import { saveProblemNote } from '@/lib/firebase/notes';
import { Bookmark, Code, FileText, PlaySquare, ExternalLink, Loader2, Save, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    Easy: 'text-green-500',
    Medium: 'text-orange-500',
    Hard: 'text-red-500',
  };

  const getPlatformIcon = (platform: string) => {
    // Basic mapping, fallback to Code icon
    const p = platform.toLowerCase();
    return <Code className="h-4 w-4" />;
  };

  return (
    <div className={cn("flex flex-col bg-card border border-border/50 rounded-lg transition-all hover:bg-muted/30", isCompleted && "opacity-60")}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4">
        {/* LEFT/TOP: Checkbox + Title + Companies */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button 
            onClick={handleToggleComplete}
            disabled={isUpdatingProgress}
            className={cn(
              "shrink-0 flex items-center justify-center h-5 w-5 sm:h-5 sm:w-5 mt-0.5 sm:mt-0 rounded-sm border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isCompleted ? "bg-green-500/20 border-green-500 text-green-500" : "bg-transparent border-border hover:border-foreground/40",
              isUpdatingProgress && "opacity-50 cursor-not-allowed"
            )}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isUpdatingProgress ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : isCompleted ? (
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            ) : null}
          </button>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className={cn("font-semibold text-base tracking-tight truncate text-foreground", isCompleted && "line-through text-muted-foreground/80")}>
              {problem.title}
            </h4>
            
            {problem.companies && problem.companies.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:mt-0.5">
                {problem.companies.slice(0, 3).map((company, i) => (
                  <span key={i} className="flex items-center text-xs px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground whitespace-nowrap">
                    {company}
                  </span>
                ))}
                {problem.companies.length > 3 && (
                  <span className="text-[11px] text-muted-foreground/70">+{problem.companies.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* BOTTOM/RIGHT: Difficulty + Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 ml-8 sm:ml-0 mt-1 sm:mt-0">
          {/* Difficulty */}
          <div className="flex sm:w-24 sm:justify-center shrink-0">
            <span className={cn(
              "text-sm font-medium", 
              difficultyColors[problem.difficulty]
            )}>
              {problem.difficulty}
            </span>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center justify-end gap-0.5 sm:gap-1">
            {problem.platform && (
              <div className="p-1.5 sm:p-2 text-green-500/70" title={problem.platform}>
                {getPlatformIcon(problem.platform)}
              </div>
            )}
            
            {problem.videoURL && (
              <a 
                href={problem.videoURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-red-500/80 hover:text-red-500 transition-colors"
                title="Video Solution"
              >
                <PlaySquare className="h-4 w-4" />
              </a>
            )}

            <button 
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className={cn("p-1.5 sm:p-2 transition-colors", note?.content ? "text-primary" : "text-muted-foreground hover:text-foreground/80")}
              title={note?.content ? 'Edit Notes' : 'Add Notes'}
            >
              <FileText className="h-4 w-4" />
            </button>

            {problem.externalURL ? (
              <a 
                href={problem.externalURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-orange-500/80 hover:text-orange-500 transition-colors"
                title="Solve Problem"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button disabled className="p-1.5 sm:p-2 text-muted-foreground/30">
                <ExternalLink className="h-4 w-4" />
              </button>
            )}

            <button 
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground/80 transition-colors"
              title="Bookmark"
              onClick={() => toast.info("Bookmark feature coming soon!")}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
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
