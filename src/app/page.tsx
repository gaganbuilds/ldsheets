'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRight, Terminal, Cpu } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CodeDepth" className="h-12 w-auto object-contain" />
          </div>

          <nav className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <Button render={<Link href="/dashboard" />} variant="default" size="sm" className="rounded-full font-semibold px-6">
                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button render={<Link href="/login" />} variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
                <Button render={<Link href="/signup" />} variant="default" size="sm" className="rounded-full font-semibold px-6">
                  Start Learning Free
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text Content */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Beta v0.1 Available Now
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
                MASTER DSA. <br />
                BUILD YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">PROBLEM-SOLVING</span>
                <br />SKILLS.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-[480px] leading-relaxed">
                Learn DSA through structured roadmaps, real coding problems, progress tracking, and a learning system built to help you improve consistently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button render={<Link href="/signup" />} size="lg" className="rounded-full font-semibold px-8 h-12 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-shadow">
                  Start Learning Free
                </Button>
                <Button render={<Link href="/login" />} size="lg" variant="outline" className="rounded-full font-semibold px-8 h-12 border-border hover:bg-muted">
                  Explore CodeDepth
                </Button>
              </div>
            </div>

            {/* Right Column: Premium Visual */}
            <div className="lg:col-span-7 relative w-full mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/10 blur-[100px] -z-10 rounded-full" />
              
              <div className="relative rounded-xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Editor Header */}
                <div className="flex items-center px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-md">
                      <Terminal className="w-3 h-3" />
                      TwoSum.cpp
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                    Run Code
                  </div>
                </div>

                {/* Editor Body */}
                <div className="p-4 sm:p-6 text-sm font-mono leading-relaxed overflow-x-auto text-gray-300">
                  <div className="flex">
                    <div className="pr-4 text-gray-600 select-none text-right flex flex-col">
                      {[...Array(14)].map((_, i) => <span key={i}>{i + 1}</span>)}
                    </div>
                    <div className="flex flex-col whitespace-pre">
                      <span><span className="text-gray-500 italic">// Find indices of two numbers that add up to target</span></span>
                      <span><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;vector&gt;</span></span>
                      <span><span className="text-pink-500">#include</span> <span className="text-green-400">&lt;unordered_map&gt;</span></span>
                      <span></span>
                      <span><span className="text-blue-400">class</span> <span className="text-yellow-200">Solution</span> {'{'}</span>
                      <span><span className="text-blue-400">public:</span></span>
                      <span>    <span className="text-blue-400">vector</span>&lt;<span className="text-blue-400">int</span>&gt; <span className="text-yellow-200">twoSum</span>(<span className="text-blue-400">vector</span>&lt;<span className="text-blue-400">int</span>&gt;&amp; nums, <span className="text-blue-400">int</span> target) {'{'}</span>
                      <span>        <span className="text-blue-400">unordered_map</span>&lt;<span className="text-blue-400">int</span>, <span className="text-blue-400">int</span>&gt; seen;</span>
                      <span>        <span className="text-pink-500">for</span> (<span className="text-blue-400">int</span> i = <span className="text-orange-400">0</span>; i &lt; nums.size(); i++) {'{'}</span>
                      <span>            <span className="text-blue-400">int</span> complement = target - nums[i];</span>
                      <span>            <span className="text-pink-500">if</span> (seen.count(complement)) {'{'}</span>
                      <span>                <span className="text-pink-500">return</span> {'{'}seen[complement], i{'}'};</span>
                      <span>            {'}'}</span>
                      <span>            seen[nums[i]] = i;</span>
                      <span>        {'}'}</span>
                      <span>        <span className="text-pink-500">return</span> {'{}'};</span>
                      <span>    {'}'}</span>
                      <span>{'}'};</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 bg-card border border-border rounded-lg p-4 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Cpu className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Accepted</p>
                  <p className="text-xs text-muted-foreground">Runtime: 0 ms</p>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute -top-6 -right-6 md:-right-8 bg-card border border-border rounded-lg p-4 shadow-xl backdrop-blur-md hidden sm:block animate-in fade-in slide-in-from-top-8 duration-1000 delay-500">
                <p className="text-xs font-semibold text-primary mb-1">XP Gained</p>
                <p className="text-2xl font-bold text-foreground">+50 XP</p>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
