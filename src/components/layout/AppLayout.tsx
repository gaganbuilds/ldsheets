import * as React from "react";
import { SidebarNav } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <SidebarNav />
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <TopNav />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
              {children}
            </div>
            {/* Footer Placeholder */}
            <footer className="border-t p-6 text-center text-sm text-muted-foreground mt-auto">
              © {new Date().getFullYear()} LearnDepth DSA. All rights reserved.
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
