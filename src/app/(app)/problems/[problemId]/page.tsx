'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProblem } from '@/lib/firebase/problems';
import { Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Terminal, Play, Send, RotateCcw, FileText, CheckCircle2, XCircle, AlertCircle, BookmarkIcon, Clock, ChevronDown, TerminalSquare, Lightbulb, Building2, Tag, Lock, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

const STARTER_CODE = {
  python: 'def solution():\n    pass\n',
  c: '#include <stdio.h>\n\nint main() {\n    return 0;\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n    }\n}\n'
};

type Language = keyof typeof STARTER_CODE;

export default function ProblemPage() {
  const { problemId } = useParams() as { problemId: string };
  const { profile } = useAuth();
  const router = useRouter();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);

  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [editorCode, setEditorCode] = useState<Record<Language, string>>(STARTER_CODE);
  const pythonWorkerRef = useRef<{ worker: Worker; isReady: boolean } | null>(null);

  const executePythonCode = (code: string, stdin: string, onInit?: () => void): Promise<any> => {
    return new Promise((resolve) => {
      if (code.length > 50000) {
        return resolve({ status: 'error', stderr: 'Code size limit exceeded.' });
      }

      if (!pythonWorkerRef.current) {
        pythonWorkerRef.current = {
          worker: new Worker(new URL('@/lib/workers/python.worker', import.meta.url), { type: 'module' }),
          isReady: false
        };
      }

      const { worker, isReady } = pythonWorkerRef.current;
      const executionId = Math.random().toString(36).substring(7);

      let executionTimeoutId: NodeJS.Timeout;
      let initTimeoutId: NodeJS.Timeout;

      const messageHandler = (e: MessageEvent) => {
        const { id, type, stdout, stderr, error } = e.data;
        
        if (id === executionId && type === 'init_success') {
           clearTimeout(initTimeoutId);
           if (pythonWorkerRef.current) {
             pythonWorkerRef.current.isReady = true;
           }
           
           executionTimeoutId = setTimeout(() => {
             worker.terminate();
             pythonWorkerRef.current = null;
             resolve({ status: 'timeout', stderr: 'Execution timed out.' });
           }, 5000);
           
           worker.postMessage({ id: executionId, type: 'run', code, stdin });
        } else if (id === executionId && type === 'init_error') {
           clearTimeout(initTimeoutId);
           worker.removeEventListener('message', messageHandler);
           resolve({ status: 'error', stderr: 'Failed to initialize Python: ' + error });
        } else if (id === executionId && type === 'success') {
           clearTimeout(executionTimeoutId);
           worker.removeEventListener('message', messageHandler);
           resolve({ status: 'success', stdout, stderr });
        } else if (id === executionId && type === 'error') {
           clearTimeout(executionTimeoutId);
           worker.removeEventListener('message', messageHandler);
           resolve({ status: 'runtime_error', stderr: error });
        }
      };

      worker.addEventListener('message', messageHandler);

      if (!isReady) {
        if (onInit) onInit();
        initTimeoutId = setTimeout(() => {
          worker.terminate();
          pythonWorkerRef.current = null;
          resolve({ status: 'error', stderr: 'Failed to initialize Python: Download timed out after 30 seconds.' });
        }, 30000);
        worker.postMessage({ id: executionId, type: 'init' });
      } else {
        executionTimeoutId = setTimeout(() => {
          worker.terminate();
          pythonWorkerRef.current = null;
          resolve({ status: 'timeout', stderr: 'Execution timed out.' });
        }, 5000);
        worker.postMessage({ id: executionId, type: 'run', code, stdin });
      }
    });
  };
  
  const [customInput, setCustomInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [activeTab, setActiveTab] = useState<'custom' | 'testcases' | 'output'>('testcases');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [testCaseResults, setTestCaseResults] = useState<Record<number, {
    status: 'Running' | 'Passed' | 'Failed' | 'Error' | 'Timeout';
    output?: string;
    expected?: string;
    stderr?: string;
  }>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      setSelectedLanguage(value as Language);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setEditorCode(prev => ({
      ...prev,
      [selectedLanguage]: value || ''
    }));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your code for this language? All changes will be lost.')) {
      setEditorCode(prev => {
        const defaultCode = problem?.starterCode?.[selectedLanguage] || STARTER_CODE[selectedLanguage];
        return {
          ...prev,
          [selectedLanguage]: defaultCode
        };
      });
    }
  };

  const handleRunCode = async () => {
    if (!profile) {
      toast.error('You must be logged in to run code.');
      return;
    }
    
    setIsExecuting(true);
    setExecutionResult(null);
    setActiveTab('output');

    try {
      let data;
      if (selectedLanguage === 'python') {
        data = await executePythonCode(editorCode[selectedLanguage], customInput, () => {
          setExecutionResult({ status: 'success', stdout: 'Loading Python environment...\n' });
        });
      } else {
        const response = await fetch('/api/code/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language: selectedLanguage,
            code: editorCode[selectedLanguage],
            stdin: customInput,
            uid: profile.uid,
          })
        });

        data = await response.json();
        if (!response.ok) {
          data = { status: 'error', stderr: data.error || 'Execution failed' };
        }
      }
      
      if (data.status === 'error' && !data.stdout && !data.stderr?.includes('Output limit')) {
        toast.error(data.stderr || 'Execution failed');
      }
      
      setExecutionResult(data);

    } catch (error) {
      toast.error('Code execution is temporarily unavailable. Please try again.');
      setExecutionResult({ status: 'error', stderr: 'Code execution is temporarily unavailable. Please try again.' });
    } finally {
      setIsExecuting(false);
    }
  };

  const normalizeOutput = (str: string) => {
    return str.replace(/\r\n/g, '\n').trimEnd();
  };

  const handleSolveExternal = () => {
    if (problem?.externalURL) {
      window.open(problem.externalURL, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('External solution link is not available for this problem yet.');
    }
  };

  const handleRunTestCase = async (index: number) => {
    if (!profile || !problem?.testCases || !problem.testCases[index]) return;
    
    setTestCaseResults(prev => ({
      ...prev,
      [index]: { status: 'Running' }
    }));
    setActiveTab('testcases');
    setSelectedTestCaseIndex(index);

    try {
      const tc = problem.testCases[index];
      let data;
      let isError = false;

      if (selectedLanguage === 'python') {
        data = await executePythonCode(editorCode[selectedLanguage], tc.input);
      } else {
        const response = await fetch('/api/code/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: selectedLanguage,
            code: editorCode[selectedLanguage],
            stdin: tc.input,
            uid: profile.uid,
          })
        });

        data = await response.json();
        if (!response.ok) {
          isError = true;
        }
      }
      
      if (isError || data.status === 'error') {
        setTestCaseResults(prev => ({
          ...prev,
          [index]: { status: 'Error', stderr: data.error || data.stderr || 'Execution failed' }
        }));
      } else if (data.status === 'compile_error' || data.status === 'runtime_error') {
         setTestCaseResults(prev => ({
          ...prev,
          [index]: { status: 'Error', stderr: data.stderr }
        }));
      } else if (data.status === 'timeout') {
         setTestCaseResults(prev => ({
          ...prev,
          [index]: { status: 'Timeout', stderr: 'Execution Timed Out' }
        }));
      } else {
        const actualOutput = data.stdout || '';
        const passed = normalizeOutput(actualOutput) === normalizeOutput(tc.expectedOutput);
        
        setTestCaseResults(prev => ({
          ...prev,
          [index]: {
            status: passed ? 'Passed' : 'Failed',
            output: actualOutput,
            expected: tc.expectedOutput
          }
        }));
      }
    } catch (error) {
      setTestCaseResults(prev => ({
        ...prev,
        [index]: { status: 'Error', stderr: 'Execution temporarily unavailable.' }
      }));
    }
  };

  const handleRunAllTestCases = async () => {
    if (!profile || !problem?.testCases) return;
    setIsRunningAll(true);
    setActiveTab('testcases');
    
    for (let i = 0; i < problem.testCases.length; i++) {
      await handleRunTestCase(i);
      // Small delay between requests to be safe
      await new Promise(r => setTimeout(r, 500)); 
    }
    
    setIsRunningAll(false);
  };

  useEffect(() => {
    if (problem) {
      const langs = problem.supportedLanguages && problem.supportedLanguages.length > 0 
        ? problem.supportedLanguages 
        : ['python'];
      
      if (!langs.includes(selectedLanguage)) {
        setSelectedLanguage(langs[0] as Language);
      }

      setEditorCode(prev => {
        const newCode = { ...prev };
        langs.forEach(l => {
          const defaultCode = problem.starterCode?.[l] || STARTER_CODE[l as Language] || '';
          if (newCode[l as Language] === STARTER_CODE[l as Language]) {
             newCode[l as Language] = defaultCode;
          }
        });
        return newCode;
      });
    }
  }, [problem, selectedLanguage]);

  useEffect(() => {
    async function loadProblem() {
      if (!problemId) return;
      try {
        const data = await getProblem(problemId);
        setProblem(data);
      } catch (error) {
        console.error('Error loading problem:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container py-8 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push('/roadmap')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roadmap
        </Button>
        <EmptyState
          icon={<Terminal className="h-12 w-12" />}
          title="Problem Not Found"
          description="Unable to load this problem. It may have been deleted or the URL is incorrect."
          action={<Button onClick={() => router.push('/roadmap')}>Return to Roadmap</Button>}
        />
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'text-green-500 bg-green-500/10 border-green-500/20',
    Medium: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    Hard: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  const allHints = [];
  if (problem.hint) allHints.push(problem.hint);
  if (problem.hints) allHints.push(...problem.hints);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] w-full overflow-y-auto lg:overflow-hidden bg-background">
      
      {/* LEFT PANEL: Problem Description */}
      <div className="w-full lg:w-[45%] lg:border-r border-border/50 flex flex-col h-auto lg:h-full bg-card overflow-hidden">
        
        {/* Header Tabs (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2.5 border-b border-border/50 bg-muted/10 shrink-0">
           <div className="flex items-center gap-2 font-semibold text-sm text-foreground bg-background px-3 py-1.5 rounded-md shadow-sm border border-border/50">
             <FileText className="w-4 h-4 text-blue-500" /> Description
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 prose prose-sm sm:prose-base dark:prose-invert max-w-none pb-12">
           <div className="flex items-center justify-between mb-4">
             <Link href="/roadmap" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Link>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
               <BookmarkIcon className="h-4 w-4" />
             </Button>
           </div>
           
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-foreground">{problem.title}</h1>
           
           <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
              <span className={cn("px-2.5 py-0.5 rounded-full font-semibold border", difficultyColors[problem.difficulty])}>
                {problem.difficulty}
              </span>
              
              {problem.companies && problem.companies.length > 0 && (
                <div className="flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                  <Building2 className="w-3 h-3 mr-1" /> {problem.companies[0]} {problem.companies.length > 1 && `+${problem.companies.length - 1}`}
                </div>
              )}

              {problem.tags && problem.tags.length > 0 && (
                <div className="flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                  <Tag className="w-3 h-3 mr-1" /> {problem.tags[0]} {problem.tags.length > 1 && `+${problem.tags.length - 1}`}
                </div>
              )}
           </div>
           
           {/* Description HTML */}
           {problem.description ? (
             <div className="text-foreground/90 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(problem.description) as string) }} />
           ) : (
             <p className="text-muted-foreground italic mb-8">Problem description will be available soon.</p>
           )}

           {/* Input Format */}
           {problem.inputFormat && (
             <div className="mt-8">
               <h3 className="text-lg font-semibold mb-2 text-foreground">Input Format</h3>
               <p className="whitespace-pre-wrap text-foreground/80 bg-muted/20 p-4 rounded-lg border border-border/50">{problem.inputFormat}</p>
             </div>
           )}

           {/* Output Format */}
           {problem.outputFormat && (
             <div className="mt-6">
               <h3 className="text-lg font-semibold mb-2 text-foreground">Output Format</h3>
               <p className="whitespace-pre-wrap text-foreground/80 bg-muted/20 p-4 rounded-lg border border-border/50">{problem.outputFormat}</p>
             </div>
           )}
           
           {/* Examples */}
           {problem.examples && problem.examples.length > 0 && (
             <div className="mt-10 space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Examples</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i}>
                    <h4 className="font-semibold mb-2 text-foreground/90">Example {i + 1}:</h4>
                    <div className="bg-muted/30 border-l-4 border-l-blue-500 rounded-r-lg p-4 font-mono text-sm space-y-3 shadow-sm">
                      <div><span className="font-semibold text-foreground">Input: </span><span className="text-foreground/80">{ex.input}</span></div>
                      <div><span className="font-semibold text-foreground">Output: </span><span className="text-foreground/80">{ex.output}</span></div>
                      {ex.explanation && <div><span className="font-semibold text-foreground">Explanation: </span><span className="text-foreground/80 font-sans">{ex.explanation}</span></div>}
                    </div>
                  </div>
                ))}
             </div>
           )}
           
           {/* Constraints */}
           {problem.constraints && problem.constraints.length > 0 && (
             <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Constraints:</h3>
                <ul className="list-none space-y-2">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="font-mono text-sm bg-muted/30 px-3 py-1.5 rounded-md inline-block w-fit border border-border/50 text-foreground/80">
                      {c}
                    </li>
                  ))}
                </ul>
             </div>
           )}
           
           {/* Hints */}
           {allHints.length > 0 && (
             <div className="mt-12 space-y-3 border-t border-border/50 pt-8">
                <h3 className="text-lg font-semibold text-foreground flex items-center mb-4">
                  <Lightbulb className="w-5 h-5 mr-2 text-amber-500" /> Hints
                </h3>
                {allHints.map((hint, i) => (
                  <details key={i} className="group bg-muted/20 border border-border/50 rounded-lg open:bg-muted/30 transition-colors">
                    <summary className="cursor-pointer px-4 py-3 font-medium text-sm text-foreground/80 hover:text-foreground list-none flex items-center justify-between">
                      Hint {i + 1}
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4 pt-1 text-sm text-foreground/80 leading-relaxed border-t border-border/50 mt-2 mx-4">
                      {hint}
                    </div>
                  </details>
                ))}
             </div>
           )}
        </div>
      </div>
      
      {/* RIGHT PANEL: Editor & Console */}
      <div className="w-full lg:w-[55%] flex flex-col h-[800px] lg:h-full overflow-hidden bg-background">
         
         {/* Editor Top Bar (Always Accessible) */}
         <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={problem?.premium}>
                  <SelectTrigger className="w-[130px] h-8 text-xs font-semibold bg-muted/30 border-border/50 focus:ring-0">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {(problem?.supportedLanguages && problem.supportedLanguages.length > 0
                      ? problem.supportedLanguages
                      : ['python']
                    ).map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-xs">
                        {lang === 'python' ? 'Python' : lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={handleReset} disabled={problem?.premium} className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" title="Reset Code">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleRunCode}
                  disabled={isExecuting || isRunningAll || problem?.premium}
                  className="h-8 text-xs font-medium bg-muted/50 hover:bg-muted"
                >
                  {isExecuting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5 text-green-500" />}
                  {isExecuting ? 'Running...' : 'Run'}
                </Button>
                <Button size="sm" disabled className="h-8 text-xs font-medium opacity-50 bg-green-600 hover:bg-green-700 text-white border-none">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Submit
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <div className={cn("flex-1 flex flex-col relative overflow-hidden", problem.premium && "pointer-events-none select-none")}>
                
                {/* EDITOR AREA */}
                <div className="flex-[3] flex flex-col border-b border-border/50 min-h-[400px]">
                  {/* Monaco Editor */}
                  <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
                    <Editor
                height="100%"
                language={selectedLanguage}
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                value={editorCode[selectedLanguage]}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 24,
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "var(--font-mono)",
                  renderWhitespace: "none",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                }}
                loading={
                  <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                }
              />
            </div>
         </div>
         
         {/* TEST CASES & OUTPUT AREA */}
         <div className="flex-[2] flex flex-col min-h-[250px] overflow-hidden bg-card shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-2 bg-muted/10 border-b border-border/50 shrink-0">
               <button 
                 className={cn("px-4 py-2 text-sm font-semibold flex items-center transition-colors relative", activeTab === 'testcases' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                 onClick={() => setActiveTab('testcases')}
               >
                 <CheckCircle2 className="w-4 h-4 mr-2" /> Testcase
                 {activeTab === 'testcases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
               </button>
               <button 
                 className={cn("px-4 py-2 text-sm font-semibold flex items-center transition-colors relative", activeTab === 'custom' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                 onClick={() => setActiveTab('custom')}
               >
                 <TerminalSquare className="w-4 h-4 mr-2" /> Custom Input
                 {activeTab === 'custom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
               </button>
               <button 
                 className={cn("px-4 py-2 text-sm font-semibold flex items-center transition-colors relative", activeTab === 'output' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                 onClick={() => setActiveTab('output')}
               >
                 <Terminal className="w-4 h-4 mr-2" /> Output
                 {activeTab === 'output' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />}
               </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              
              {/* Test Cases Tab */}
              {activeTab === 'testcases' && (
                <div className="flex flex-col h-full overflow-hidden">
                  {(!problem?.testCases || problem.testCases.length === 0) ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                      <p className="text-muted-foreground/60 text-sm">No test cases available yet.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center p-2 border-b border-border/50 shrink-0 overflow-x-auto gap-2 bg-muted/5">
                        {problem.testCases.map((_, i) => {
                          const res = testCaseResults[i];
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedTestCaseIndex(i)}
                              className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2",
                                selectedTestCaseIndex === i 
                                  ? "bg-muted text-foreground shadow-sm border border-border/50" 
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              {res?.status === 'Passed' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                              {res?.status === 'Failed' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                              {res?.status === 'Error' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                              Case {i + 1}
                            </button>
                          );
                        })}
                        <div className="flex-1" />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={handleRunAllTestCases}
                          disabled={isRunningAll || isExecuting}
                          className="h-8 text-xs shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {isRunningAll ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                          Run All
                        </Button>
                      </div>
                      
                      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
                        {(() => {
                          const tc = problem.testCases[selectedTestCaseIndex];
                          const res = testCaseResults[selectedTestCaseIndex];
                          return (
                            <div className="space-y-6 max-w-3xl">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input</label>
                                <pre className="p-3 bg-muted/30 rounded-lg font-mono text-sm whitespace-pre-wrap border border-border/50 text-foreground/90">{tc.input || '(empty)'}</pre>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Output</label>
                                <pre className="p-3 bg-muted/30 rounded-lg font-mono text-sm whitespace-pre-wrap border border-border/50 text-foreground/90">{tc.expectedOutput || '(empty)'}</pre>
                              </div>
                              
                              {res && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Output</label>
                                    <div className="flex items-center gap-2">
                                      {res.status === 'Running' && <span className="text-blue-500 text-xs font-semibold flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin"/> Running</span>}
                                      {res.status === 'Passed' && <span className="text-green-500 text-xs font-semibold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted</span>}
                                      {res.status === 'Failed' && <span className="text-red-500 text-xs font-semibold flex items-center"><XCircle className="w-3.5 h-3.5 mr-1" /> Wrong Answer</span>}
                                      {res.status === 'Error' && <span className="text-red-500 text-xs font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Error</span>}
                                      {res.status === 'Timeout' && <span className="text-orange-500 text-xs font-semibold flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Time Limit Exceeded</span>}
                                    </div>
                                  </div>
                                  
                                  {res.status === 'Running' ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm border rounded-lg bg-muted/10">Executing...</div>
                                  ) : (
                                    <pre className={cn("p-3 rounded-lg font-mono text-sm whitespace-pre-wrap border", 
                                      res.status === 'Passed' ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400" :
                                      res.status === 'Failed' ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" :
                                      "bg-muted/30 border-border/50 text-foreground/90"
                                    )}>
                                      {res.output ?? res.stderr ?? '(no output)'}
                                    </pre>
                                  )}
                                </div>
                              )}
                              
                              {!res && (
                                <div className="pt-2 flex">
                                  <Button onClick={() => handleRunTestCase(selectedTestCaseIndex)} disabled={isRunningAll || isExecuting} size="sm" variant="secondary" className="h-8 text-xs">
                                    Run Test Case
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Custom Input Tab */}
              {activeTab === 'custom' && (
                <div className="flex flex-col h-full p-4">
                  <div className="flex-1 relative">
                    <textarea 
                      className="w-full h-full bg-muted/20 border border-border/50 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      placeholder="Enter custom input here..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                     <Button 
                        size="sm" 
                        onClick={handleRunCode}
                        disabled={isExecuting || isRunningAll}
                        className="h-8 text-xs font-medium"
                      >
                        {isExecuting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                        Run Custom Input
                      </Button>
                  </div>
                </div>
              )}

              {/* Output Tab */}
              {activeTab === 'output' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="px-4 py-2 border-b border-border/50 bg-muted/10 shrink-0 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Console Output</span>
                    {executionResult && (
                      <Button variant="ghost" size="sm" onClick={() => setExecutionResult(null)} className="h-6 text-xs text-muted-foreground hover:text-foreground">
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-6 overflow-auto font-mono text-sm relative">
                    {isExecuting ? (
                      <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Executing your code...
                      </div>
                    ) : executionResult ? (
                      <div className="space-y-4 max-w-3xl">
                        {executionResult.status === 'compile_error' && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <div className="text-red-500 font-semibold mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Compilation Error</div>
                            <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                          </div>
                        )}
                        {executionResult.status === 'runtime_error' && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <div className="text-red-500 font-semibold mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Runtime Error</div>
                            <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                          </div>
                        )}
                        {executionResult.status === 'timeout' && (
                          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                            <div className="text-orange-500 font-semibold mb-2 flex items-center"><Clock className="w-4 h-4 mr-2" /> Time Limit Exceeded</div>
                            <pre className="text-orange-400 whitespace-pre-wrap">Code execution exceeded the allowed execution time.</pre>
                          </div>
                        )}
                        {executionResult.status === 'error' && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <div className="text-red-500 font-semibold mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> System Error</div>
                            <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                          </div>
                        )}
                        {executionResult.status === 'success' && (
                          <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
                            <div className="text-muted-foreground font-semibold mb-2 text-xs uppercase tracking-wider">Standard Output</div>
                            <pre className="whitespace-pre-wrap text-foreground/90">{executionResult.stdout || <span className="text-muted-foreground/50 italic">No output</span>}</pre>
                            {executionResult.stderr && (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="text-yellow-500 font-semibold mb-2 text-xs uppercase tracking-wider">Standard Error</div>
                                <pre className="text-yellow-400/90 whitespace-pre-wrap">{executionResult.stderr}</pre>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {executionResult.executionTime !== undefined && (
                          <div className="text-xs text-muted-foreground mt-4 absolute top-2 right-4">
                            Time: {executionResult.executionTime}ms
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground/60 text-sm">Run your code to see results here.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
            
          {/* PRO OVERLAY */}
          {problem.premium && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
               
               {/* Backdrop Blur Layer */}
               <div className="absolute inset-0 bg-background/40 backdrop-blur-md z-40" />

               {/* Pro Card */}
               <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 relative z-50 bg-card p-8 rounded-2xl border border-border/50 shadow-2xl w-[90%] max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6 border border-border/50 shadow-inner">
                     <Lock className="w-7 h-7 text-foreground/80" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3 text-center">This is a Pro Feature</h2>
                  <p className="text-base text-center text-muted-foreground mb-8 max-w-sm leading-relaxed">
                    Unlock the code editor and run your solution on our platform.
                  </p>
                  
                  <div className="w-full max-w-xs space-y-3">
                    <Button 
                      className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg flex items-center justify-center py-6 shadow-md transition-all hover:shadow-lg"
                      onClick={() => setShowProModal(true)}
                    >
                      <Sparkles className="w-5 h-5 mr-2" /> Upgrade to Pro
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full rounded-lg flex items-center justify-center py-6 border-border/50 bg-background hover:bg-muted transition-all shadow-sm"
                      onClick={handleSolveExternal}
                    >
                      <ExternalLink className="w-5 h-5 mr-2" /> Solve on External
                    </Button>
                  </div>
               </div>
            </div>
          )}
            
        </div>
      </div>

      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" /> Pro Feature
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-muted-foreground leading-relaxed text-base">
              Pro access is coming soon. We're working on bringing this feature to CodeDepth.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProModal(false)} className="w-full sm:w-auto px-8">Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      </div>
    </div>
  );
}
