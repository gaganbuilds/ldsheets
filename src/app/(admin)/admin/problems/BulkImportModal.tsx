import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Problem, Roadmap, Topic } from '@/types';
import { Upload, Download, FileText, X, AlertCircle, CheckCircle2, Eye, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { bulkCreateProblems } from '@/lib/firebase/problems';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  problems: Problem[];
  roadmaps: Roadmap[];
  topics: Topic[];
}

interface ParsedProblemRow {
  _rowNum: number;
  title: string;
  slug: string;
  difficulty: string;
  roadmap: string;
  topic: string;
  description: string;
  platform: string;
  externalURL: string;
  estimatedTime: string;
  tags: string;
  companies: string;
  displayOrder: string;
  isActive: string;
  premium: string;
  videoURL: string;
  articleURL: string;
  hint: string;
  supportedLanguages: string;
  
  _status: 'Valid' | 'Error';
  _errors: string[];
}

const ValidationSummary = ({ data }: { data: ParsedProblemRow[] }) => {
  const total = data.length;
  const valid = data.filter(d => d._status === 'Valid').length;
  const invalid = total - valid;
  const duplicates = data.filter(d => d._errors.some(e => e.toLowerCase().includes('duplicate'))).length;

  const isReady = invalid === 0 && total > 0;

  return (
    <div className={`p-5 rounded-md border shadow-sm ${isReady ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10'}`}>
      <h3 className="font-semibold text-lg mb-4">{isReady ? 'Bulk Import Ready' : 'Bulk Import Validation'}</h3>
      <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm max-w-xs mb-4">
        <div className="text-muted-foreground">Total {isReady ? 'problems' : 'rows'}</div>
        <div className="font-medium text-right">{total}</div>
        
        <div className="text-muted-foreground">Valid {isReady ? 'problems' : 'rows'}</div>
        <div className="font-medium text-right text-green-600 dark:text-green-500">{valid}</div>
        
        {isReady ? (
          <>
            <div className="text-muted-foreground">Errors</div>
            <div className="font-medium text-right">0</div>
          </>
        ) : (
          <>
            <div className="text-muted-foreground">Invalid rows</div>
            <div className="font-medium text-right text-red-600 dark:text-red-500">{invalid}</div>
            
            <div className="text-muted-foreground">Duplicates</div>
            <div className="font-medium text-right text-amber-600 dark:text-amber-500">{duplicates}</div>
          </>
        )}
      </div>
      <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center font-medium">
        {isReady ? (
          <span className="text-green-600 dark:text-green-500 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" /> ✓ Ready for import</span>
        ) : (
          <span className="text-red-600 dark:text-red-500 flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> ❌ Import blocked</span>
        )}
      </div>
    </div>
  );
};

const ProblemDetailModal = ({ row, onClose }: { row: ParsedProblemRow | null, onClose: () => void }) => {
  if (!row) return null;
  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Row Preview (Row {row._rowNum})</DialogTitle>
          <DialogDescription>
            Previewing extracted data. <strong>No data has been saved to Firestore.</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm mt-2">
          {[
            { label: 'Title', value: row.title },
            { label: 'Slug', value: row.slug },
            { label: 'Difficulty', value: row.difficulty },
            { label: 'Section (Roadmap)', value: row.roadmap },
            { label: 'Topic', value: row.topic },
            { label: 'Platform', value: row.platform },
            { label: 'External URL', value: row.externalURL },
            { label: 'Estimated Time', value: row.estimatedTime },
            { label: 'Tags', value: row.tags },
            { label: 'Companies', value: row.companies },
            { label: 'Display Order', value: row.displayOrder },
            { label: 'Supported Langs', value: row.supportedLanguages },
          ].map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 border-b border-border/50 pb-2">
              <span className="font-semibold text-muted-foreground">{item.label}</span>
              <span className="col-span-3">{item.value || <span className="text-muted-foreground/50">Empty</span>}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2">
            <span className="font-semibold text-muted-foreground">Description</span>
            <div className="col-span-3 whitespace-pre-wrap font-mono text-xs bg-muted/40 p-3 rounded-md max-h-64 overflow-y-auto border">
              {row.description || <span className="text-muted-foreground/50 italic">No description provided</span>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function BulkImportModal({ isOpen, onClose, onSuccess, problems, roadmaps, topics }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProblemRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedPreviewRow, setSelectedPreviewRow] = useState<ParsedProblemRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New States for Import Flow
  const [isConfirming, setIsConfirming] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number, failed: number } | null>(null);

  const handleDownloadTemplate = () => {
    const headers = [
      'title', 'slug', 'difficulty', 'roadmap', 'topic', 'platform', 
      'externalURL', 'estimatedTime', 'tags', 'companies', 'displayOrder', 
      'isActive', 'premium', 'videoURL', 'articleURL', 'hint', 
      'description', 'supportedLanguages'
    ];
    
    const exampleRow = [
      'Two Sum', 'two-sum', 'Easy', roadmaps[0]?.title || 'Arrays 101', topics[0]?.title || 'Hash Map', 'LeetCode',
      'https://leetcode.com/problems/two-sum', '15', 'array, hash-table', 'google, amazon', '1',
      'true', 'false', '', '', 'Try using a hash map',
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'python, java, cpp'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.map(val => `"${val.replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'problems_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleReset(); // Clear previous data
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB size limit.');
      handleReset();
      return;
    }

    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        
        if (rows.length > 1000) {
          toast.error('Maximum limit of 1000 rows exceeded.');
          setIsParsing(false);
          handleReset();
          return;
        }

        // Pass 1: detect duplicates within the uploaded CSV
        const csvSlugs = new Set<string>();
        const csvTitles = new Set<string>();
        const duplicateSlugs = new Set<string>();
        const duplicateTitles = new Set<string>();

        rows.forEach(row => {
          const s = row.slug?.trim().toLowerCase();
          const t = row.title?.trim().toLowerCase();
          if (s) {
            if (csvSlugs.has(s)) duplicateSlugs.add(s);
            csvSlugs.add(s);
          }
          if (t) {
            if (csvTitles.has(t)) duplicateTitles.add(t);
            csvTitles.add(t);
          }
        });

        // Pass 2: validate each row
        const validatedRows = rows.map((row, index) => 
          validateRow(row, index + 2, duplicateSlugs, duplicateTitles)
        );
        
        setParsedData(validatedRows);
        setIsParsing(false);
      },
      error: (error) => {
        console.error('CSV Parse Error', error);
        toast.error('Failed to parse CSV file.');
        setIsParsing(false);
        handleReset();
      }
    });
  };

  const validateRow = (
    row: any, 
    rowNum: number, 
    csvDuplicateSlugs: Set<string>, 
    csvDuplicateTitles: Set<string>
  ): ParsedProblemRow => {
    const errors: string[] = [];
    
    // Normalize string fields
    const rawTitle = row.title?.trim() || '';
    const rawSlug = row.slug?.trim() || '';
    const rawRoadmap = row.roadmap?.trim() || '';
    const rawTopic = row.topic?.trim() || '';
    const rawDifficulty = row.difficulty?.trim() || '';

    // Required fields check
    if (!rawTitle) errors.push('Title is required.');
    if (!rawSlug) errors.push('Slug is required.');
    if (!rawRoadmap) errors.push('Section (Roadmap) is required.');
    if (!rawTopic) errors.push('Topic is required.');
    if (!rawDifficulty) errors.push('Difficulty is required.');
    
    // Difficulty validation
    if (rawDifficulty && !['Easy', 'Medium', 'Hard'].includes(rawDifficulty)) {
      errors.push(`Difficulty '${rawDifficulty}' is invalid. Must be Easy, Medium, or Hard.`);
    }

    // Roadmap validation
    const roadmapMatch = roadmaps.find(r => r.title.trim().toLowerCase() === rawRoadmap.toLowerCase());
    if (!roadmapMatch && rawRoadmap) {
      errors.push(`Section '${rawRoadmap}' does not exist.`);
    }

    // Topic validation
    let topicMatch = undefined;
    if (roadmapMatch && rawTopic) {
      topicMatch = topics.find(t => 
        t.title.trim().toLowerCase() === rawTopic.toLowerCase() && 
        t.roadmapId === roadmapMatch.id
      );
      if (!topicMatch) {
        errors.push(`Topic '${rawTopic}' does not exist in section '${roadmapMatch.title}'.`);
      }
    } else if (!roadmapMatch && rawTopic) {
      errors.push(`Topic '${rawTopic}' cannot be verified without a valid section.`);
    }

    // Internal CSV Duplicate Detection
    if (rawTitle && csvDuplicateTitles.has(rawTitle.toLowerCase())) {
      errors.push(`Duplicate title '${rawTitle}' detected within the CSV.`);
    }
    if (rawSlug && csvDuplicateSlugs.has(rawSlug.toLowerCase())) {
      errors.push(`Duplicate slug '${rawSlug}' detected within the CSV.`);
    }

    // Existing Database Duplicate Detection
    if (rawSlug && topicMatch) {
      const isSlugInDb = problems.some(p => p.slug === rawSlug && p.topicId === topicMatch.id);
      if (isSlugInDb) {
        errors.push(`Problem with slug '${rawSlug}' already exists in this topic in the database.`);
      }
    }
    if (rawTitle && topicMatch) {
      const isTitleInDb = problems.some(p => p.title.toLowerCase() === rawTitle.toLowerCase() && p.topicId === topicMatch.id);
      if (isTitleInDb) {
        errors.push(`Problem with title '${rawTitle}' already exists in this topic in the database.`);
      }
    }

    return {
      _rowNum: rowNum,
      title: rawTitle,
      slug: rawSlug,
      difficulty: rawDifficulty,
      roadmap: rawRoadmap,
      topic: rawTopic,
      description: row.description?.trim() || '',
      platform: row.platform?.trim() || '',
      externalURL: row.externalURL?.trim() || '',
      estimatedTime: row.estimatedTime?.trim() || '',
      tags: row.tags?.trim() || '',
      companies: row.companies?.trim() || '',
      displayOrder: row.displayOrder?.trim() || '',
      isActive: row.isActive?.trim() || '',
      premium: row.premium?.trim() || '',
      videoURL: row.videoURL?.trim() || '',
      articleURL: row.articleURL?.trim() || '',
      hint: row.hint?.trim() || '',
      supportedLanguages: row.supportedLanguages?.trim() || '',
      _status: errors.length > 0 ? 'Error' : 'Valid',
      _errors: errors
    };
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setIsConfirming(false);
    setIsImporting(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirmImportClick = () => {
    setIsConfirming(true);
  };

  const handleActualImport = async () => {
    if (isImporting) return;
    setIsImporting(true);
    try {
      const problemsToCreate = parsedData.map(row => {
        const roadmapMatch = roadmaps.find(r => r.title.trim().toLowerCase() === row.roadmap.toLowerCase())!;
        const topicMatch = topics.find(t => t.title.trim().toLowerCase() === row.topic.toLowerCase() && t.roadmapId === roadmapMatch.id)!;
        
        return {
          title: row.title,
          slug: row.slug,
          difficulty: row.difficulty as 'Easy' | 'Medium' | 'Hard',
          roadmapId: roadmapMatch.id,
          topicId: topicMatch.id,
          description: row.description || '',
          platform: row.platform || '',
          externalURL: row.externalURL || '',
          estimatedTime: parseInt(row.estimatedTime) || 15,
          tags: row.tags ? row.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
          companies: row.companies ? row.companies.split(',').map(s => s.trim()).filter(Boolean) : [],
          displayOrder: parseInt(row.displayOrder) || 0,
          isActive: row.isActive ? row.isActive.toLowerCase() === 'true' : true,
          premium: row.premium ? row.premium.toLowerCase() === 'true' : false,
          videoURL: row.videoURL || '',
          articleURL: row.articleURL || '',
          hint: row.hint || '',
          supportedLanguages: row.supportedLanguages ? row.supportedLanguages.split(',').map(s => s.trim()).filter(Boolean) : ['python'],
        };
      });

      const result = await bulkCreateProblems(problemsToCreate);
      setImportResult(result);
    } catch (error) {
      console.error(error);
      toast.error('A critical error occurred during import.');
      setImportResult({ imported: 0, failed: parsedData.length });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFinish = () => {
    handleReset();
    onSuccess();
  };

  const totalRows = parsedData.length;
  const invalidRows = parsedData.filter(d => d._status === 'Error').length;
  const isReady = totalRows > 0 && invalidRows === 0;

  // View 3: Result Summary
  if (importResult) {
    const isFullSuccess = importResult.failed === 0;
    
    // Group imported by roadmap for display
    const roadmapCounts: Record<string, number> = {};
    if (isFullSuccess) {
      parsedData.forEach(row => {
        roadmapCounts[row.roadmap] = (roadmapCounts[row.roadmap] || 0) + 1;
      });
    }

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isFullSuccess ? 'Import Complete' : 'Import Partially Completed'}</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className={`p-4 border rounded-md ${isFullSuccess ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
              <div className="flex items-center text-lg font-semibold mb-2">
                {isFullSuccess ? (
                  <span className="flex items-center text-green-700 dark:text-green-500"><CheckCircle2 className="mr-2" /> {importResult.imported} problems imported</span>
                ) : (
                  <span className="flex items-center text-red-700 dark:text-red-500"><AlertCircle className="mr-2" /> Import Issues Detected</span>
                )}
              </div>
              
              {!isFullSuccess && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                  <div className="text-muted-foreground">Total:</div>
                  <div className="font-medium text-right">{totalRows}</div>
                  <div className="text-muted-foreground">Imported:</div>
                  <div className="font-medium text-right text-green-600">{importResult.imported}</div>
                  <div className="text-muted-foreground">Failed:</div>
                  <div className="font-medium text-right text-red-600">{importResult.failed}</div>
                </div>
              )}

              {isFullSuccess && (
                <div className="mt-4 space-y-1">
                  {Object.entries(roadmapCounts).map(([section, count]) => (
                    <div key={section} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{section}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-3 mt-3 border-t">
                    <span className="text-muted-foreground">Existing problems:</span>
                    <span className="font-medium">0 modified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleFinish}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // View 2: Confirmation
  if (isConfirming) {
    const uniqueSectionsCount = new Set(parsedData.map(r => r.roadmap)).size;
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ready to Import</DialogTitle>
            <DialogDescription>Please review before proceeding.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-muted/20 p-4 border rounded-md">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted-foreground">Total problems:</span> <span className="font-medium">{totalRows}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Sections affected:</span> <span className="font-medium">{uniqueSectionsCount}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Valid rows:</span> <span className="font-medium text-green-600">{totalRows}</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Errors:</span> <span className="font-medium">0</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Duplicates:</span> <span className="font-medium">0</span></li>
              </ul>
            </div>
            <div className="text-sm border-l-4 border-blue-500 pl-4 py-1 text-muted-foreground">
              This action will add <strong>{totalRows}</strong> problems to Firestore. <br />
              Existing problems will not be modified.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={isImporting}>Cancel</Button>
            <Button onClick={handleActualImport} disabled={isImporting}>
              {isImporting ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : 'Import Problems'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // View 1: Main Upload & Preview
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Bulk Import Problems</DialogTitle>
            <DialogDescription>
              Upload a CSV file to validate and preview problems. 
              <strong> No data will be written to Firestore in this step.</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2">
            {/* Upload & Template Area */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border p-4 rounded-lg bg-muted/10">
              <div className="flex items-center gap-4 flex-wrap">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isParsing}>
                  <Upload className="w-4 h-4 mr-2" />
                  Select CSV File
                </Button>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm font-medium bg-background px-3 py-1.5 rounded-full border shadow-sm">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {file.name}
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full hover:bg-muted" onClick={handleReset}>
                      <X className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="secondary" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* Preview & Validation Area */}
            {parsedData.length > 0 && (
              <div className="space-y-6">
                
                <ValidationSummary data={parsedData} />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Final Preview
                  </h3>
                  
                  <div className="border rounded-md w-full overflow-x-auto max-h-[40vh] overflow-y-auto bg-background">
                    <Table className="min-w-[900px]">
                      <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 shadow-sm">
                        <TableRow>
                          <TableHead className="w-16">Row</TableHead>
                          <TableHead className="w-56">Title</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Section (Roadmap)</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead className="w-64">Status</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.map((row, i) => (
                          <TableRow key={i} className={row._status === 'Error' ? 'bg-red-50/30 hover:bg-red-50/50 dark:bg-red-950/10' : ''}>
                            <TableCell className="font-medium text-muted-foreground">{row._rowNum}</TableCell>
                            <TableCell className="font-medium">{row.title || '-'}</TableCell>
                            <TableCell>{row.difficulty || '-'}</TableCell>
                            <TableCell>{row.roadmap || '-'}</TableCell>
                            <TableCell>{row.topic || '-'}</TableCell>
                            <TableCell className="font-mono text-xs">{row.slug || '-'}</TableCell>
                            <TableCell>
                              {row._status === 'Valid' ? (
                                <div className="flex items-center text-green-600 dark:text-green-500 font-medium">
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> ✓ Valid
                                </div>
                              ) : (
                                <div className="flex flex-col text-red-600 dark:text-red-500 text-sm">
                                  <div className="flex items-center font-semibold mb-1">
                                    <AlertCircle className="w-4 h-4 mr-1" /> ❌ Error
                                  </div>
                                  <ul className="list-disc pl-5 space-y-0.5 mt-1">
                                    {row._errors.map((err, idx) => (
                                      <li key={idx} className="text-xs leading-tight">{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPreviewRow(row)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 pt-4 border-t mt-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            
            {parsedData.length > 0 && !isReady && (
              <div className="flex items-center mr-auto text-sm text-red-600 font-medium">
                Fix {invalidRows} error{invalidRows > 1 ? 's' : ''} before importing.
              </div>
            )}

            {parsedData.length > 0 && isReady && (
              <div className="flex items-center mr-auto text-sm text-green-600 font-medium">
                {totalRows} problems are ready to import.
              </div>
            )}

            <Button disabled={!isReady || parsedData.length === 0} onClick={handleConfirmImportClick}>
              Continue to Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProblemDetailModal row={selectedPreviewRow} onClose={() => setSelectedPreviewRow(null)} />
    </>
  );
}
