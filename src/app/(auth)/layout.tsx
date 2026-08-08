import { PublicRoute } from "@/components/auth/PublicRoute";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Code2Icon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2Icon className="size-5" />
            </div>
            <span className="text-xl tracking-tight hidden sm:inline-block">
              LearnDepth
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
          <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </PublicRoute>
  );
}
