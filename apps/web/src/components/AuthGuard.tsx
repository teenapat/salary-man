'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const PUBLIC_PATHS = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, isPublicPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sm-bg">
        <ArrowPathIcon className="w-8 h-8 text-sm-accent animate-spin" />
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}

