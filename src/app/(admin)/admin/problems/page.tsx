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
import { Loader2Icon, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { BulkImportModal } from './BulkImportModal';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
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
      setCurrentProblem({
        ...problem,
        testCases: problem.testCases || []
      });
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
        description: '',
        supportedLanguages: ['python'],
        testCases: [],
        examples: [],
        constraints: [],
        hints: [],
        inputFormat: '',
        outputFormat: '',
        starterCode: {},
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

  const toggleLanguage = (lang: string) => {
    const currentLangs = currentProblem.supportedLanguages || ['python'];
    if (currentLangs.includes(lang)) {
      setCurrentProblem({ ...currentProblem, supportedLanguages: currentLangs.filter(l => l !== lang) });
    } else {
      setCurrentProblem({ ...currentProblem, supportedLanguages: [...currentLangs, lang] });
    }
  };

  const addTestCase = () => {
    setCurrentProblem(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), { input: '', expectedOutput: '' }]
    }));
  };

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    setCurrentProblem(prev => {
      const newTestCases = [...(prev.testCases || [])];
      newTestCases[index] = { ...newTestCases[index], [field]: value };
      return { ...prev, testCases: newTestCases };
    });
  };

  const removeTestCase = (index: number) => {
    setCurrentProblem(prev => {
      const newTestCases = [...(prev.testCases || [])];
      newTestCases.splice(index, 1);
      return { ...prev, testCases: newTestCases };
    });
  };

  const addExample = () => {
    setCurrentProblem(prev => ({
      ...prev,
      examples: [...(prev.examples || []), { input: '', output: '', explanation: '' }]
    }));
  };

  const updateExample = (index: number, field: 'input' | 'output' | 'explanation', value: string) => {
    setCurrentProblem(prev => {
      const newExamples = [...(prev.examples || [])];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return { ...prev, examples: newExamples };
    });
  };

  const removeExample = (index: number) => {
    setCurrentProblem(prev => {
      const newExamples = [...(prev.examples || [])];
      newExamples.splice(index, 1);
      return { ...prev, examples: newExamples };
    });
  };

  const addConstraint = () => {
    setCurrentProblem(prev => ({ ...prev, constraints: [...(prev.constraints || []), ''] }));
  };

  const updateConstraint = (index: number, value: string) => {
    setCurrentProblem(prev => {
      const newConstraints = [...(prev.constraints || [])];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  };

  const removeConstraint = (index: number) => {
    setCurrentProblem(prev => {
      const newConstraints = [...(prev.constraints || [])];
      newConstraints.splice(index, 1);
      return { ...prev, constraints: newConstraints };
    });
  };

  const addHint = () => {
    setCurrentProblem(prev => ({ ...prev, hints: [...(prev.hints || []), ''] }));
  };

  const updateHint = (index: number, value: string) => {
    setCurrentProblem(prev => {
      const newHints = [...(prev.hints || [])];
      newHints[index] = value;
      return { ...prev, hints: newHints };
    });
  };

  const removeHint = (index: number) => {
    setCurrentProblem(prev => {
      const newHints = [...(prev.hints || [])];
      newHints.splice(index, 1);
      return { ...prev, hints: newHints };
    });
  };

  const updateStarterCode = (lang: string, code: string) => {
    setCurrentProblem(prev => ({
      ...prev,
      starterCode: { ...(prev.starterCode || {}), [lang]: code }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Manage DSA problems.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" /> Add Problem
          </Button>
        </div>
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

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium">Description (Markdown supported)</label>
                <textarea
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  value={currentProblem.description || ''}
                  onChange={e => setCurrentProblem({...currentProblem, description: e.target.value})}
                  placeholder="Enter problem description. You can use Markdown formatting..."
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-1">
                <label className="text-sm font-medium">Input Format (optional)</label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  value={currentProblem.inputFormat || ''}
                  onChange={e => setCurrentProblem({...currentProblem, inputFormat: e.target.value})}
                  placeholder="E.g., The first line contains an integer n..."
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-1">
                <label className="text-sm font-medium">Output Format (optional)</label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                  value={currentProblem.outputFormat || ''}
                  onChange={e => setCurrentProblem({...currentProblem, outputFormat: e.target.value})}
                  placeholder="E.g., Print the indices of the two numbers..."
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

              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isPremium" 
                    checked={currentProblem.premium ?? false}
                    onChange={e => setCurrentProblem({...currentProblem, premium: e.target.checked})}
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium">Pro Feature</label>
                </div>
                {currentProblem.premium && !currentProblem.externalURL && (
                  <p className="text-xs text-amber-500 font-medium mt-1">
                    Warning: Pro problems should have an external solution URL.
                  </p>
                )}
              </div>

              <div className="space-y-3 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/20">
                <label className="text-sm font-medium">Supported Languages</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: 'python', label: 'Python' },
                    { id: 'c', label: 'C' },
                    { id: 'cpp', label: 'C++' },
                    { id: 'java', label: 'Java' },
                  ].map((lang) => (
                    <div key={lang.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`lang-${lang.id}`} 
                        checked={(currentProblem.supportedLanguages || ['python']).includes(lang.id)}
                        onChange={() => toggleLanguage(lang.id)}
                      />
                      <label htmlFor={`lang-${lang.id}`} className="text-sm font-medium">{lang.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Code Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/10">
                <label className="text-sm font-medium">Starter Code (Optional)</label>
                <p className="text-xs text-muted-foreground mb-2">Define default starter code for each language to pre-populate the editor.</p>
                <div className="space-y-4">
                  {(currentProblem.supportedLanguages || ['python']).map(lang => (
                    <div key={lang} className="space-y-1">
                      <label className="text-xs font-semibold uppercase">{lang}</label>
                      <textarea
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                        value={(currentProblem.starterCode || {})[lang] || ''}
                        onChange={e => updateStarterCode(lang, e.target.value)}
                        placeholder={`Starter code for ${lang}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Examples</label>
                  <Button type="button" variant="outline" size="sm" onClick={addExample}>
                    <Plus className="h-4 w-4 mr-1" /> Add Example
                  </Button>
                </div>
                {(currentProblem.examples || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No examples added.</p>
                ) : (
                  <div className="space-y-4">
                    {currentProblem.examples!.map((ex, index) => (
                      <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-background relative group">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                          onClick={() => removeExample(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <h4 className="text-sm font-semibold mb-2">Example {index + 1}</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold">Input</label>
                            <textarea
                              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
                              value={ex.input}
                              onChange={e => updateExample(index, 'input', e.target.value)}
                              placeholder="e.g. nums = [2,7,11,15], target = 9"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold">Output</label>
                            <textarea
                              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
                              value={ex.output}
                              onChange={e => updateExample(index, 'output', e.target.value)}
                              placeholder="e.g. [0,1]"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 mt-2">
                          <label className="text-xs font-semibold">Explanation (optional)</label>
                          <textarea
                            className="w-full min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                            value={ex.explanation || ''}
                            onChange={e => updateExample(index, 'explanation', e.target.value)}
                            placeholder="Explanation of the example..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Constraints Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Constraints</label>
                  <Button type="button" variant="outline" size="sm" onClick={addConstraint}>
                    <Plus className="h-4 w-4 mr-1" /> Add Constraint
                  </Button>
                </div>
                {(currentProblem.constraints || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No constraints added.</p>
                ) : (
                  <div className="space-y-2">
                    {currentProblem.constraints!.map((c, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                        <Input
                          className="font-mono text-sm flex-1"
                          value={c}
                          onChange={e => updateConstraint(index, e.target.value)}
                          placeholder="e.g. 2 <= nums.length <= 10^4"
                        />
                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeConstraint(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hints Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Hints</label>
                  <Button type="button" variant="outline" size="sm" onClick={addHint}>
                    <Plus className="h-4 w-4 mr-1" /> Add Hint
                  </Button>
                </div>
                {/* Legacy single hint support */}
                {currentProblem.hint && (!currentProblem.hints || currentProblem.hints.length === 0) && (
                  <div className="mb-4 space-y-1">
                    <label className="text-xs text-amber-600 font-semibold">Legacy Hint (will be preserved if new hints not added)</label>
                    <textarea
                      className="w-full min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                      value={currentProblem.hint}
                      onChange={e => setCurrentProblem({...currentProblem, hint: e.target.value})}
                    />
                  </div>
                )}
                {(currentProblem.hints || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No hints added.</p>
                ) : (
                  <div className="space-y-2">
                    {currentProblem.hints!.map((h, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-xs text-muted-foreground mt-3 w-4">{index + 1}.</span>
                        <textarea
                          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                          value={h}
                          onChange={e => updateHint(index, e.target.value)}
                          placeholder={`Hint ${index + 1}...`}
                        />
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-1" onClick={() => removeHint(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Cases */}
              <div className="space-y-4 col-span-1 md:col-span-2 border rounded-md p-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Test Cases</label>
                  <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                    <Plus className="h-4 w-4 mr-1" /> Add Test Case
                  </Button>
                </div>
                {(currentProblem.testCases || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No test cases added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {currentProblem.testCases!.map((tc, index) => (
                      <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-background relative group">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => removeTestCase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-0">
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold">Input</label>
                            <textarea
                              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                              value={tc.input}
                              onChange={e => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Test case input..."
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold">Expected Output</label>
                            <textarea
                              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                              value={tc.expectedOutput}
                              onChange={e => updateTestCase(index, 'expectedOutput', e.target.value)}
                              placeholder="Expected output..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Bulk Import Modal */}
      <BulkImportModal 
        isOpen={isBulkImportOpen} 
        onClose={() => setIsBulkImportOpen(false)} 
        onSuccess={() => {
          setIsBulkImportOpen(false);
          fetchData();
        }}
        problems={problems}
        roadmaps={roadmaps}
        topics={topics}
      />

    </div>
  );
}
