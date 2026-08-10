'use client';

import { useState, useEffect } from 'react';
import { getProblems, createProblem, updateProblem, deleteProblem } from '@/lib/firebase/problems';
import { getTopics } from '@/lib/firebase/topics';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { Problem, Topic, Roadmap } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2Icon, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [problemsData, topicsData, roadmapsData] = await Promise.all([
        getProblems(),
        getTopics(),
        getRoadmaps()
      ]);
      setProblems(problemsData);
      setTopics(topicsData);
      setRoadmaps(roadmapsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (problem?: Problem) => {
    if (problem) {
      setCurrentProblem(problem);
    } else {
      setCurrentProblem({
        roadmapId: roadmaps.length > 0 ? roadmaps[0].id : '',
        topicId: topics.length > 0 ? topics[0].id : '',
        title: '',
        slug: '',
        difficulty: 'Easy',
        platform: '',
        externalURL: '',
        estimatedTime: 15,
        tags: [],
        companies: [],
        displayOrder: 0,
        isActive: true,
        premium: false,
        videoURL: '',
        articleURL: '',
        hint: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleOpenDelete = (problem: Problem) => {
    setCurrentProblem(problem);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentProblem.title || !currentProblem.slug || !currentProblem.roadmapId || !currentProblem.topicId) {
      toast.error('Roadmap, Topic, Title, and Slug are required');
      return;
    }
    if ((currentProblem.estimatedTime ?? -1) < 0) {
      toast.error('Estimated time cannot be negative');
      return;
    }
    if ((currentProblem.displayOrder ?? -1) < 0) {
      toast.error('Display Order must be a positive number');
      return;
    }
    if (currentProblem.externalURL && !currentProblem.externalURL.startsWith('http')) {
      toast.error('External URL must be a valid URL starting with http or https');
      return;
    }
    
    // Duplicate slug check within the same topic
    const isDuplicate = problems.some(
      p => p.slug === currentProblem.slug && p.topicId === currentProblem.topicId && p.id !== currentProblem.id
    );
    if (isDuplicate) {
      toast.error('Slug must be unique within the selected topic');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentProblem.id) {
        await updateProblem(currentProblem.id, currentProblem as any);
        toast.success('Problem updated successfully');
      } else {
        await createProblem(currentProblem as any);
        toast.success('Problem created successfully');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProblem.id) return;
    setIsSubmitting(true);
    try {
      await deleteProblem(currentProblem.id);
      toast.success('Problem deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Manage DSA problems.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add Problem
        </Button>
      </div>

      <div className="flex items-center">
        <Input 
          placeholder="Search problems..." 
          className="max-w-sm" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-md w-full overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <Loader2Icon className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No problems found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => {
                const topicTitle = topics.find(t => t.id === problem.topicId)?.title || 'Unknown';
                return (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>{topicTitle}</TableCell>
                    <TableCell>{problem.difficulty}</TableCell>
                    <TableCell>{problem.displayOrder}</TableCell>
                    <TableCell>{problem.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(problem)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(problem)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentProblem.id ? 'Edit Problem' : 'Create Problem'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Roadmap</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={currentProblem.roadmapId || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, roadmapId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a roadmap</option>
                  {roadmaps.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Topic</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={currentProblem.topicId || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, topicId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a topic</option>
                  {topics.filter(t => t.roadmapId === currentProblem.roadmapId).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={currentProblem.title || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, title: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                  value={currentProblem.slug || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, slug: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={currentProblem.difficulty || 'Easy'} 
                  onChange={e => setCurrentProblem({...currentProblem, difficulty: e.target.value as any})}
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform (e.g. LeetCode)</label>
                <Input 
                  value={currentProblem.platform || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, platform: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">External URL</label>
                <Input 
                  type="url"
                  value={currentProblem.externalURL || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, externalURL: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Time (mins)</label>
                <Input 
                  type="number"
                  min="0"
                  value={currentProblem.estimatedTime ?? 15} 
                  onChange={e => setCurrentProblem({...currentProblem, estimatedTime: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input 
                  type="number"
                  min="0"
                  value={currentProblem.displayOrder ?? 0} 
                  onChange={e => setCurrentProblem({...currentProblem, displayOrder: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input 
                  value={(currentProblem.tags || []).join(', ')} 
                  onChange={e => setCurrentProblem({...currentProblem, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Companies (comma separated)</label>
                <Input 
                  value={(currentProblem.companies || []).join(', ')} 
                  onChange={e => setCurrentProblem({...currentProblem, companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Video URL (optional)</label>
                <Input 
                  type="url"
                  value={currentProblem.videoURL || ''} 
                  onChange={e => setCurrentProblem({...currentProblem, videoURL: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActiveProb" 
                  checked={currentProblem.isActive ?? true}
                  onChange={e => setCurrentProblem({...currentProblem, isActive: e.target.checked})}
                />
                <label htmlFor="isActiveProb" className="text-sm font-medium">Active</label>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isPremium" 
                  checked={currentProblem.premium ?? false}
                  onChange={e => setCurrentProblem({...currentProblem, premium: e.target.checked})}
                />
                <label htmlFor="isPremium" className="text-sm font-medium">Premium</label>
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete the problem <strong>{currentProblem.title}</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
