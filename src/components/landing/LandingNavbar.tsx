'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRight } from 'lucide-react';

export function LandingNavbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/logo.png" alt="CodeDepth" className="h-12 w-auto object-contain" />
          </Link>
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
  );
}
