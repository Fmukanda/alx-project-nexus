'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallback 
}: AuthGuardProps) {
  const { state: authState } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (authState.isLoading) return;

    if (requireAuth && !authState.isAuthenticated) {
      // Redirect to login with return url
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    if (requireAdmin && authState.isAuthenticated && !authState.user?.is_staff) {
      // Redirect to home if not admin
      router.push('/');
      return;
    }
  }, [authState, requireAuth, requireAdmin, router, pathname]);

  // Show loading while checking authentication
  if (authState.isLoading) {
    return <PageLoader />;
  }

  // Show fallback or nothing if requirements not met
  if ((requireAuth && !authState.isAuthenticated) || 
      (requireAdmin && (!authState.user?.is_staff))) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
}

// Higher Order Component for pages
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Higher Order Component for admin pages
export function withAdminAuth<T extends object>(Component: React.ComponentType<T>) {
  return withAuth(Component, { requireAdmin: true });
}