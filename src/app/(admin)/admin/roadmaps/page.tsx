'use client';

import { useState, useEffect } from 'react';
import { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } from '@/lib/firebase/roadmaps';
import { getTopics } from '@/lib/firebase/topics';
import { Roadmap } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader2Icon, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentRoadmap, setCurrentRoadmap] = useState<Partial<Roadmap>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const data = await getRoadmaps();
      setRoadmaps(data);
    } catch (error) {
      toast.error('Failed to fetch roadmaps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (roadmap?: Roadmap) => {
    if (roadmap) {
      setCurrentRoadmap(roadmap);
    } else {
      setCurrentRoadmap({
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

  const handleOpenDelete = (roadmap: Roadmap) => {
    setCurrentRoadmap(roadmap);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentRoadmap.title || !currentRoadmap.slug) {
      toast.error('Title and Slug are required');
      return;
    }
    if ((currentRoadmap.displayOrder ?? -1) < 0) {
      toast.error('Display Order must be a positive number');
      return;
    }
    
    // Duplicate slug check
    const isDuplicate = roadmaps.some(
      r => r.slug === currentRoadmap.slug && r.id !== currentRoadmap.id
    );
    if (isDuplicate) {
      toast.error('Slug must be unique');
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentRoadmap.id) {
        await updateRoadmap(currentRoadmap.id, currentRoadmap as any);
        toast.success('Roadmap updated successfully');
      } else {
        await createRoadmap(currentRoadmap as any);
        toast.success('Roadmap created successfully');
      }
      setIsFormOpen(false);
      fetchRoadmaps();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentRoadmap.id) return;
    setIsSubmitting(true);
    try {
      const relatedTopics = await getTopics(currentRoadmap.id);
      if (relatedTopics.length > 0) {
        toast.error(`Cannot delete roadmap. It still has ${relatedTopics.length} topic(s). Please delete them first.`);
        setIsDeleteOpen(false);
        return;
      }

      await deleteRoadmap(currentRoadmap.id);
      toast.success('Roadmap deleted successfully');
      setIsDeleteOpen(false);
      fetchRoadmaps();
    } catch (error) {
      toast.error('Failed to delete roadmap');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRoadmaps = roadmaps.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roadmaps</h1>
          <p className="text-muted-foreground">Manage your learning roadmaps.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> Add Roadmap
        </Button>
      </div>

      <div className="flex items-center">
        <Input 
          placeholder="Search roadmaps..." 
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
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2Icon className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredRoadmaps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No roadmaps found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoadmaps.map((roadmap) => (
                <TableRow key={roadmap.id}>
                  <TableCell className="font-medium">{roadmap.title}</TableCell>
                  <TableCell>{roadmap.slug}</TableCell>
                  <TableCell>{roadmap.displayOrder}</TableCell>
                  <TableCell>{roadmap.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(roadmap)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(roadmap)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-lg overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentRoadmap.id ? 'Edit Roadmap' : 'Create Roadmap'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={currentRoadmap.title || ''} 
                  onChange={e => setCurrentRoadmap({...currentRoadmap, title: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input 
                  value={currentRoadmap.slug || ''} 
                  onChange={e => setCurrentRoadmap({...currentRoadmap, slug: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={currentRoadmap.description || ''} 
                  onChange={e => setCurrentRoadmap({...currentRoadmap, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon (optional)</label>
                  <Input 
                    value={currentRoadmap.icon || ''} 
                    onChange={e => setCurrentRoadmap({...currentRoadmap, icon: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input 
                    type="number"
                    min="0"
                    value={currentRoadmap.displayOrder ?? 0} 
                    onChange={e => setCurrentRoadmap({...currentRoadmap, displayOrder: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={currentRoadmap.isActive ?? true}
                  onChange={e => setCurrentRoadmap({...currentRoadmap, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
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
            Are you sure you want to delete the roadmap <strong>{currentRoadmap.title}</strong>? This action cannot be undone.
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
