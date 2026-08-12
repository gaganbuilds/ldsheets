import React from 'react';
import Link from 'next/link';
import { Search, Bookmark, CheckCircle2, Circle } from 'lucide-react';

export function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24 z-10 relative">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-[1.1] tracking-tight">
            Make every minute of practice count.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl">
            Less friction. More focused practice.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          
          {/* Large Top Card */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 overflow-hidden flex flex-col lg:flex-row group transition-all hover:bg-card hover:border-primary/50 relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
            
            {/* Left Content */}
            <div className="flex flex-col justify-center p-8 lg:p-12 lg:w-1/2 relative z-10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Find problems instantly</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Search problems and topics without digging through pages. Find what you want to practice and get started immediately.
              </p>
            </div>
            
            {/* Right Visual Demo */}
            <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center relative min-h-[350px] lg:min-h-[450px] z-10">
              
              {/* Mock Search UI */}
              <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl overflow-hidden relative z-10 flex flex-col">
                <div className="flex items-center px-4 py-4 border-b border-border/50 gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden whitespace-nowrap h-6 flex items-center">
                    <span className="text-foreground text-lg inline-block overflow-hidden animate-type-text border-r-2 border-primary pr-1">sliding</span>
                  </div>
                </div>
                
                <div className="p-3 flex flex-col gap-2">
                  <div className="px-4 py-3 rounded-lg bg-muted flex flex-col relative overflow-hidden animate-fade-in-sequence">
                    <span className="text-sm font-medium text-foreground relative z-10">Sliding Window</span>
                    <span className="text-xs text-muted-foreground relative z-10">Array • Medium</span>
                  </div>
                  <div className="px-4 py-3 rounded-lg flex flex-col opacity-50">
                    <span className="text-sm font-medium text-foreground">Valid Parentheses</span>
                    <span className="text-xs text-muted-foreground">Stack • Easy</span>
                  </div>
                  <div className="px-4 py-3 rounded-lg flex flex-col opacity-50">
                    <span className="text-sm font-medium text-foreground">Two Sum</span>
                    <span className="text-xs text-muted-foreground">Array • Easy</span>
                  </div>
                  <div className="px-4 py-3 rounded-lg flex flex-col opacity-50">
                    <span className="text-sm font-medium text-foreground">Binary Search</span>
                    <span className="text-xs text-muted-foreground">Searching • Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left: Bookmarks */}
          <div className="rounded-2xl border border-border bg-card/40 overflow-hidden flex flex-col group transition-all hover:bg-card hover:border-primary/50 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />
            <div className="p-8 lg:p-10 flex flex-col flex-1 relative z-10">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Bookmark className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Save what matters</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Bookmark problems you want to revisit instead of searching for them again.
              </p>
              
              {/* Mock Bookmark UI */}
              <div className="mt-auto relative rounded-xl border border-border bg-background shadow-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
                  <span className="text-sm font-semibold text-foreground">Your Bookmarks</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-foreground">Two Sum</span>
                    <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg transition-colors animate-fade-in-sequence">
                    <span className="text-sm font-medium text-foreground">Sliding Window</span>
                    <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500" />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-foreground">Binary Search</span>
                    <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Progress */}
          <div className="rounded-2xl border border-border bg-card/40 overflow-hidden flex flex-col group transition-all hover:bg-card hover:border-primary/50 relative">
            <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none" />
            <div className="p-8 lg:p-10 flex flex-col flex-1 relative z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Know your next move</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                See what you've completed and keep your practice moving forward.
              </p>
              
              {/* Mock Progress UI */}
              <div className="mt-auto relative rounded-xl border border-border bg-background shadow-lg overflow-hidden flex flex-col p-6">
                <div className="flex justify-between items-end mb-5">
                  <span className="text-sm font-semibold text-foreground">Today's Practice</span>
                  <div className="relative h-5 w-[4ch] overflow-hidden">
                     <span className="absolute inset-0 flex items-center justify-end text-sm font-medium text-muted-foreground animate-fade-out-sequence">
                       3 / 5
                     </span>
                     <span className="absolute inset-0 flex items-center justify-end text-sm font-medium text-emerald-500 animate-fade-in-sequence">
                       4 / 5
                     </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-foreground">Arrays</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-foreground">Two Pointer</span>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className="relative w-5 h-5">
                      <Circle className="absolute inset-0 w-5 h-5 text-muted-foreground animate-fade-out-sequence" />
                      <CheckCircle2 className="absolute inset-0 w-5 h-5 text-emerald-500 opacity-0 animate-fade-in-sequence" />
                    </div>
                    <span className="text-sm text-foreground">Sliding Window</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground opacity-70">Binary Search</span>
                  </div>
                </div>
                <div className="mt-6 h-2 w-full bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 animate-progress-fill rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
