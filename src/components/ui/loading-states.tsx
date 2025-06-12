import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { Card } from './card';
import { Skeleton } from './skeleton';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'md',
  text = 'Loading...',
  className = '',
}) => {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-muted rounded h-8 w-3/4 mb-4"></div>
        <div className="bg-muted rounded h-4 w-full mb-2"></div>
        <div className="bg-muted rounded h-4 w-2/3"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size={size} />
      {text && (
        <p className="mt-4 text-muted-foreground text-sm">{text}</p>
      )}
    </div>
  );
};

export const PageLoadingState: React.FC<{ text?: string }> = ({ 
  text = 'Loading page...' 
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingState size="lg" text={text} />
  </div>
);

export const CardLoadingState: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <Card className={`p-6 ${className}`}>
    <LoadingState type="skeleton" />
  </Card>
);

export const InlineLoadingState: React.FC<{ text?: string }> = ({ 
  text = 'Loading...' 
}) => (
  <div className="flex items-center gap-2 py-2">
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);