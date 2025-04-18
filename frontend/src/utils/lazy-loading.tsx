import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component shown while lazy loading
export const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <span className="ml-2 text-lg">Loading...</span>
  </div>
);

// Helper function to create lazy-loaded components with proper typings
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: { suspenseFallback?: React.ReactNode }
) {
  const LazyComponent = lazy(importFunc);
  
  const fallback = options?.suspenseFallback || <LoadingFallback />;
  
  return (props: React.ComponentProps<T>): JSX.Element => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Example usage:
// const LazyHomePage = lazyLoad(() => import('@/pages/Home'));
