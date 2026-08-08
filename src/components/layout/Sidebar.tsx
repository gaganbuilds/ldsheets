"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  BarChart2,
  Trophy,
  User,
  Settings,
  Shield,
  Layers,
  FileCode2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "DSA Roadmap", href: "/roadmap", icon: Map },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Roadmaps", href: "/admin/roadmaps", icon: Map },
  { name: "Topics", href: "/admin/topics", icon: Layers },
  { name: "Problems", href: "/admin/problems", icon: FileCode2 },
  { name: "Global Settings", href: "/admin/settings", icon: Settings },
];

export function SidebarNav({ className, ...props }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();
  
  const isAdminView = pathname.startsWith('/admin');
  const navigation = isAdminView ? adminNavigation : studentNavigation;

  return (
    <div className={cn("flex flex-col h-full bg-background border-r", className)} {...props}>
      <div className="p-6 hidden md:block">
        <span className="font-bold tracking-tight text-xl">
          LearnDepth {isAdminView ? "Admin" : "DSA"}
        </span>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        {(profile?.role === 'admin' || profile?.isAdmin) && (
          <Button variant="outline" className="w-full justify-start" render={<Link href={isAdminView ? "/dashboard" : "/admin"} />}>
              <Shield className="mr-2 h-4 w-4" />
              {isAdminView ? "Exit Admin" : "Admin Panel"}
          </Button>
        )}
      </div>
    </div>
  );
}
