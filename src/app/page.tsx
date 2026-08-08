import { Button } from '@/components/ui/button';
import { PublicRoute } from '@/components/auth/PublicRoute';
import Link from 'next/link';

export default function Home() {
  return (
    <PublicRoute>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6 md:p-24">
        <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
            Beta v0.1
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Master DSA, <br />
            <span className="text-primary">Gamified.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-[600px] mb-8">
            The ultimate platform to organize, track, and visualize your Data Structures and Algorithms preparation with a premium, focused experience.
          </p>
          <div className="flex gap-4 items-center">
            <Button size="lg" className="rounded-full font-semibold" render={<Link href="/signup" />}>
              Start Roadmap
            </Button>
            <Button size="lg" variant="outline" className="rounded-full font-semibold" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>
        </div>
      </main>
    </PublicRoute>
  );
}

