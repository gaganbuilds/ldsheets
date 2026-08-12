import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Map, Target, Code2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OutcomesSection() {
  return (
    <section className="py-20 md:py-32 border-t border-border bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Built for Developers Who Want to Get Better
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            From problem-solving fundamentals to interview preparation, CodeDepth helps you build consistency through focused practice.
          </p>
          <Button render={<Link href="/signup" />} size="lg" className="rounded-full font-semibold px-8 h-12 shadow-sm hover:shadow-md transition-all">
            Explore CodeDepth <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* Card 1: Large Feature */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#B3A9FF] p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-xl col-span-1 sm:col-span-2 lg:col-span-2 min-h-[280px] sm:min-h-[320px]">
            <div>
              <p className="text-sm font-semibold text-black/70 mb-3 sm:mb-4 tracking-wider">DSA • Problem Solving</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-[1.1] mb-3 sm:mb-4">
                Build the problem-solving skills that make coding interviews easier.
              </h3>
              <p className="text-black/80 font-medium text-base sm:text-lg max-w-md">
                Practice patterns, strengthen fundamentals, and track your progress.
              </p>
            </div>
            <div className="absolute bottom-6 right-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 hidden sm:block">
              <ArrowUpRight className="w-6 h-6 text-black/60 group-hover:text-black" />
            </div>
          </div>

          {/* Card 2: Small */}
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg col-span-1 sm:col-span-1 lg:col-span-1 min-h-[200px] sm:min-h-[320px]">
            <div className="mb-4 sm:mb-6 rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110 duration-300">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1 sm:mb-2">DSA Roadmaps</h4>
            <p className="text-sm text-muted-foreground text-center font-medium">Structured practice</p>
          </div>

          {/* Card 3: Small */}
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg col-span-1 sm:col-span-1 lg:col-span-1 min-h-[200px] sm:min-h-[320px]">
            <div className="mb-4 sm:mb-6 rounded-full bg-blue-500/10 p-4 transition-transform group-hover:scale-110 duration-300">
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1 sm:mb-2">Interview Prep</h4>
            <p className="text-sm text-muted-foreground text-center font-medium">Practice with purpose</p>
          </div>

          {/* Card 4: Small */}
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg col-span-1 sm:col-span-1 lg:col-span-1 min-h-[200px] sm:min-h-[320px]">
            <div className="mb-4 sm:mb-6 rounded-full bg-emerald-500/10 p-4 transition-transform group-hover:scale-110 duration-300">
              <Code2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1 sm:mb-2">Core CS</h4>
            <p className="text-sm text-muted-foreground text-center font-medium">Strengthen fundamentals</p>
          </div>

          {/* Card 5: Small */}
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 transition-all hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg col-span-1 sm:col-span-1 lg:col-span-1 min-h-[200px] sm:min-h-[320px]">
            <div className="mb-4 sm:mb-6 rounded-full bg-orange-500/10 p-4 transition-transform group-hover:scale-110 duration-300">
              <Layers className="w-8 h-8 text-orange-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1 sm:mb-2">System Design</h4>
            <p className="text-sm text-muted-foreground text-center font-medium">Think beyond code</p>
          </div>

          {/* Card 6: Large Feature */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#E5F773] p-6 sm:p-8 transition-transform hover:-translate-y-1 hover:shadow-xl col-span-1 sm:col-span-2 lg:col-span-2 min-h-[280px] sm:min-h-[320px]">
            <div>
              <p className="text-sm font-semibold text-black/70 mb-3 sm:mb-4 tracking-wider">Consistency • Growth</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-[1.1] max-w-md">
                Small practice every day compounds into stronger technical skills.
              </h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-black font-bold text-lg">
              Keep Learning <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
