import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-8 md:py-12 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Top/Main Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          
          {/* Logo & Product Line */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" aria-label="CodeDepth Home">
              <img src="/logo.png" alt="CodeDepth Logo" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-xs text-muted-foreground text-center md:text-left max-w-[200px] md:max-w-none">
              CodeDepth is a product of LearnDepth Academy LLP
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">About</Link>
            <span className="hidden sm:inline-block w-px h-3 bg-border" />
            <Link href="#" className="hover:text-foreground transition-colors">Contact us</Link>
            <span className="hidden sm:inline-block w-px h-3 bg-border" />
            <Link href="#" className="hover:text-foreground transition-colors">Pricing</Link>
            <span className="hidden sm:inline-block w-px h-3 bg-border" />
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span className="hidden sm:inline-block w-px h-3 bg-border" />
            <Link href="#" className="hover:text-foreground transition-colors">Terms and Conditions</Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/learndepth_academy/" target="_blank" rel="noopener noreferrer" aria-label="LearnDepth Academy on Instagram" className="text-muted-foreground hover:text-foreground transition-colors p-2 md:p-0">
              <InstagramIcon className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            </a>
            <a href="https://www.linkedin.com/company/learndepth-academy" target="_blank" rel="noopener noreferrer" aria-label="LearnDepth Academy on LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors p-2 md:p-0">
              <LinkedinIcon className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            </a>
            <a href="https://www.learndepth.in/" target="_blank" rel="noopener noreferrer" aria-label="LearnDepth Academy website" className="text-muted-foreground hover:text-foreground transition-colors p-2 md:p-0">
              <Globe className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-border/30 flex justify-center">
          <p className="text-xs text-muted-foreground italic text-center px-4">
            Copyright © 2026 LearnDepth Academy LLP. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
