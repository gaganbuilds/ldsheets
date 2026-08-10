'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && !(profile.role === 'admin' || profile.isAdmin)) {
        router.push('/roadmap');
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (profile && !(profile.role === 'admin' || profile.isAdmin))) {
    return null;
  }

  return <>{children}</>;
};
