'use client';

import { useState, useEffect } from 'react';
import { getTopics, createTopic, updateTopic, deleteTopic } from '@/lib/firebase/topics';
import { getRoadmaps } from '@/lib/firebase/roadmaps';
import { getProblems } from '@/lib/firebase/problems';
import { Topic, Roadmap } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2Icon, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Partial<Topic>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsData, roadmapsData] = await Promise.all([
        getTopics(),
        getRoadmaps()
      ]);
      setTopics(topicsData);
      setRoadmaps(roadmapsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (topic?: Topic) => {
    if (topic) {
      setCurrentTopic(topic);
    } else {
      setCurrentTopic({
        roadmapId: roadmaps.length > 0 ? roadmaps[0].id : '',
        title: '',
        slug: '',
        description: '',
        icon: '',
        displayOrder: 0,
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleOpenDelete = (topic: Topic) => {
    setCurrentTopic(topic);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentTopic.title || !currentTopic.slug || !currentTopic.roadmapId) {
      toast.error('Roadmap, Title, and Slug are required');
      return;
    }
    if ((currentTopic.displayOrder ?? -1) < 0) {
      toast.error('Display Order must be a positive number');
      return;
    }
    
    // Duplicate slug check within the same roadmap
    const isDuplicate = topics.some(
      t => t.slug === currentTopic.slug && t.roadmapId === currentTopic.roadmapId && t.id !== currentTopic.id
    );
    if (isDuplicate) {
      toast.error('Slug must be unique within the selected roadmap');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentTopic.id) {
        await updateTopic(currentTopic.id, currentTopic as any);
        toast.success('Topic updated successfully');
      } else {
        await createTopic(currentTopic as any);
        toast.success('Topic created successfully');
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
    if (!currentTopic.id) return;
    setIsSubmitting(true);
    try {
      const relatedProblems = await getProblems(currentTopic.id);
      if (relatedProblems.length > 0) {
        toast.error(`Cannot delete topic. It still has ${relatedProblems.length} problem(s). Please delete them first.`);
        setIsDeleteOpen(false);
        return;
      }

      await deleteTopic(currentTopic.id);
      toast.success('Topic deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
          <p className="text-muted-foreground">Manage roadmap topics.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add Topic
        </Button>
      </div>

      <div className="flex items-center">
        <Input 
          placeholder="Search topics..." 
          className="max-w-sm" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-md w-full overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Roadmap</TableHead>
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
            ) : filteredTopics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No topics found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTopics.map((topic) => {
                const roadmapTitle = roadmaps.find(r => r.id === topic.roadmapId)?.title || 'Unknown';
                return (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.title}</TableCell>
                    <TableCell>{topic.slug}</TableCell>
                    <TableCell>{roadmapTitle}</TableCell>
                    <TableCell>{topic.displayOrder}</TableCell>
                    <TableCell>{topic.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenForm(topic)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(topic)}>
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
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentTopic.id ? 'Edit Topic' : 'Create Topic'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Roadmap</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={currentTopic.roadmapId || ''} 
                  onChange={e => setCurrentTopic({...currentTopic, roadmapId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a roadmap</option>
                  {roadmaps.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={currentTopic.title || ''} 
                  onChange={e => setCurrentTopic({...currentTopic, title: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                  value={currentTopic.slug || ''} 
                  onChange={e => setCurrentTopic({...currentTopic, slug: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={currentTopic.description || ''} 
                  onChange={e => setCurrentTopic({...currentTopic, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon (optional)</label>
                  <Input 
                    value={currentTopic.icon || ''} 
                    onChange={e => setCurrentTopic({...currentTopic, icon: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input 
                    type="number"
                    min="0"
                    value={currentTopic.displayOrder ?? 0} 
                    onChange={e => setCurrentTopic({...currentTopic, displayOrder: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActiveTopic" 
                  checked={currentTopic.isActive ?? true}
                  onChange={e => setCurrentTopic({...currentTopic, isActive: e.target.checked})}
                />
                <label htmlFor="isActiveTopic" className="text-sm font-medium">Active</label>
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
            Are you sure you want to delete the topic <strong>{currentTopic.title}</strong>? This action cannot be undone.
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
