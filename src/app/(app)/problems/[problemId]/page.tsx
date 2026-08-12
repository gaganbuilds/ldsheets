'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProblem } from '@/lib/firebase/problems';
import { Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { Loader2, ArrowLeft, Terminal, Play, Send, RotateCcw } from 'lucide-react';
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

  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('python');
  const [editorCode, setEditorCode] = useState<Record<Language, string>>(STARTER_CODE);
  
  const [customInput, setCustomInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [activeTab, setActiveTab] = useState<'custom' | 'testcases'>('custom');
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
      setEditorCode(prev => ({
        ...prev,
        [selectedLanguage]: STARTER_CODE[selectedLanguage]
      }));
    }
  };

  const handleRunCode = async () => {
    if (!profile) {
      toast.error('You must be logged in to run code.');
      return;
    }
    
    setIsExecuting(true);
    setExecutionResult(null);
    setActiveTab('custom');

    try {
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

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Execution failed');
        setExecutionResult({ status: 'error', stderr: data.error || 'Execution failed' });
      } else {
        setExecutionResult(data);
      }

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

  const handleRunTestCase = async (index: number) => {
    if (!profile || !problem?.testCases || !problem.testCases[index]) return;
    
    setTestCaseResults(prev => ({
      ...prev,
      [index]: { status: 'Running' }
    }));

    try {
      const tc = problem.testCases[index];
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

      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
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

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[calc(100vh-4rem)] xl:h-[calc(100vh-4rem)] w-full gap-4 p-4 overflow-y-auto xl:overflow-hidden">
      {/* Left Panel: Problem Statement */}
      <div className="flex-1 flex flex-col min-w-0 bg-card border border-border/50 rounded-xl shadow-sm h-full overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/20 flex flex-col gap-4 shrink-0">
          <Link href="/roadmap" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" /> Roadmap
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">{problem.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", difficultyColors[problem.difficulty])}>
                {problem.difficulty}
              </span>
              {problem.tags?.map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          {problem.description ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(problem.description) as string) }} />
          ) : (
            <p className="text-muted-foreground italic">Problem description will be available soon.</p>
          )}

          {problem.hint && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Hint</h3>
              <p className="text-muted-foreground">{problem.hint}</p>
            </div>
          )}

          {problem.companies && problem.companies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Companies</h3>
              <div className="flex flex-wrap gap-2">
                {problem.companies.map((company, i) => (
                  <span key={i} className="px-3 py-1 rounded-md text-sm bg-muted/50 border border-border/50 text-foreground">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Coding Workspace Placeholder */}
      <div className="flex-1 xl:max-w-[55%] flex flex-col min-w-0 gap-4 h-[800px] xl:h-full">
        {/* Editor Area */}
        <div className="flex-[3] flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20 shrink-0">
            <div className="flex items-center gap-2">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-background border-border/50">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {(problem?.supportedLanguages && problem.supportedLanguages.length > 0
                    ? problem.supportedLanguages
                    : ['python']
                  ).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang === 'python' ? 'Python' : lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Reset Code">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRunCode}
                disabled={isExecuting || isRunningAll}
              >
                {isExecuting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
              <Button size="sm" disabled className="opacity-50">
                <Send className="h-4 w-4 mr-1.5" />
                Submit
              </Button>
            </div>
          </div>
          
          {/* Editor Body */}
          <div className="flex-1 relative overflow-hidden">
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
              }}
              loading={
                <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            />
          </div>
        </div>

        {/* Output / Test Area */}
        <div className="flex-1 flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm min-h-[300px] shrink-0">
          <div className="flex items-center gap-1 border-b border-border/50 bg-muted/20 px-2 pt-2 shrink-0">
            <button 
              className={cn("px-4 py-2 text-sm font-medium rounded-t-md transition-colors", activeTab === 'custom' ? 'bg-background border-t border-l border-r border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground')}
              onClick={() => setActiveTab('custom')}
            >
              Custom Input
            </button>
            <button 
              className={cn("px-4 py-2 text-sm font-medium rounded-t-md transition-colors", activeTab === 'testcases' ? 'bg-background border-t border-l border-r border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground')}
              onClick={() => setActiveTab('testcases')}
            >
              Test Cases
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'custom' ? (
              <>
                <div className="p-2 border-b border-border/50 shrink-0">
                  <textarea 
                    className="w-full h-24 bg-background border border-border/50 rounded-md p-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter custom input here..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
                
                <div className="px-4 py-2 border-b border-border/50 bg-muted/20 shrink-0 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Execution Output</span>
                  {executionResult && (
                    <Button variant="ghost" size="sm" onClick={() => setExecutionResult(null)} className="h-6 text-xs text-muted-foreground hover:text-foreground">
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-auto font-mono text-sm relative">
                  {isExecuting ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Executing...
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-4">
                      {executionResult.status === 'compile_error' && (
                        <div>
                          <div className="text-red-500 font-semibold mb-1">Compilation Error</div>
                          <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                        </div>
                      )}
                      {executionResult.status === 'runtime_error' && (
                        <div>
                          <div className="text-red-500 font-semibold mb-1">Runtime Error</div>
                          <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                        </div>
                      )}
                      {executionResult.status === 'timeout' && (
                        <div>
                          <div className="text-orange-500 font-semibold mb-1">Execution Timed Out</div>
                          <pre className="text-orange-400 whitespace-pre-wrap">Code execution exceeded the allowed execution time.</pre>
                        </div>
                      )}
                      {executionResult.status === 'error' && (
                        <div>
                          <div className="text-red-500 font-semibold mb-1">System Error</div>
                          <pre className="text-red-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
                        </div>
                      )}
                      {executionResult.status === 'success' && (
                        <div>
                          <div className="text-green-500 font-semibold mb-1">Output</div>
                          <pre className="whitespace-pre-wrap">{executionResult.stdout || 'No output'}</pre>
                          {executionResult.stderr && (
                            <div className="mt-4">
                              <div className="text-yellow-500 font-semibold mb-1">Standard Error</div>
                              <pre className="text-yellow-400 whitespace-pre-wrap">{executionResult.stderr}</pre>
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
                      <p className="text-muted-foreground/60">Run your code to see results here.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {(!problem?.testCases || problem.testCases.length === 0) ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-muted-foreground/60">No test cases available for this problem.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-2 border-b border-border/50 shrink-0 overflow-x-auto">
                      <div className="flex gap-2 min-w-max">
                        {problem.testCases.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedTestCaseIndex(i)}
                            className={cn(
                              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                              selectedTestCaseIndex === i 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            Case {i + 1}
                          </button>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={handleRunAllTestCases}
                        disabled={isRunningAll || isExecuting}
                        className="ml-4 shrink-0"
                      >
                        {isRunningAll ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
                        Run All
                      </Button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4 space-y-6">
                      {(() => {
                        const tc = problem.testCases[selectedTestCaseIndex];
                        const res = testCaseResults[selectedTestCaseIndex];
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">Test Case {selectedTestCaseIndex + 1}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => {
                                  setCustomInput(tc.input);
                                  setActiveTab('custom');
                                  toast.success('Test case copied to Custom Input');
                                }}
                              >
                                Use Test Case
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input</label>
                                <pre className="p-3 bg-muted/30 rounded-md font-mono text-sm whitespace-pre-wrap border border-border/50">{tc.input || '(empty)'}</pre>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Output</label>
                                <pre className="p-3 bg-muted/30 rounded-md font-mono text-sm whitespace-pre-wrap border border-border/50">{tc.expectedOutput || '(empty)'}</pre>
                              </div>
                              
                              {res && (
                                <div className="space-y-1.5 mt-6 pt-4 border-t border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Output</label>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium">Status:</span>
                                      {res.status === 'Running' && <span className="text-blue-500 text-xs font-semibold flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin"/> Running</span>}
                                      {res.status === 'Passed' && <span className="text-green-500 text-xs font-semibold">✓ Passed</span>}
                                      {res.status === 'Failed' && <span className="text-red-500 text-xs font-semibold">✕ Failed</span>}
                                      {res.status === 'Error' && <span className="text-red-500 text-xs font-semibold">⚠ Error</span>}
                                      {res.status === 'Timeout' && <span className="text-orange-500 text-xs font-semibold">⏱ Timeout</span>}
                                    </div>
                                  </div>
                                  
                                  {res.status === 'Running' ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">Executing...</div>
                                  ) : (
                                    <pre className={cn("p-3 rounded-md font-mono text-sm whitespace-pre-wrap border", 
                                      res.status === 'Passed' ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400" :
                                      res.status === 'Failed' ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" :
                                      "bg-muted/30 border-border/50"
                                    )}>
                                      {res.output ?? res.stderr ?? '(no output)'}
                                    </pre>
                                  )}
                                </div>
                              )}
                              
                              {!res && (
                                <div className="mt-4 pt-4 border-t border-border/50 flex justify-center">
                                  <Button onClick={() => handleRunTestCase(selectedTestCaseIndex)} disabled={isRunningAll || isExecuting} size="sm" variant="secondary">
                                    Run This Case
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
