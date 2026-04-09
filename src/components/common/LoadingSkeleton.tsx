import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'list' | 'text';
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  rows = 3,
  className
}) => {
  const Pulse = ({ className }: { className?: string }) => (
    <div className={cn("bg-slate-200 animate-pulse rounded", className)} />
  );

  if (type === 'table') {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 overflow-hidden", className)}>
        <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-4">
          {[1, 2, 3, 4].map((i) => <Pulse key={i} className="h-4 w-24" />)}
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-16 border-b border-slate-50 flex items-center px-6 gap-4">
            {[1, 2, 3, 4].map((j) => <Pulse key={j} className="h-4 w-full" />)}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-6", className)}>
        <Pulse className="h-6 w-1/3 mb-4" />
        <Pulse className="h-20 w-full mb-4" />
        <div className="flex gap-2">
          <Pulse className="h-8 w-20" />
          <Pulse className="h-8 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(rows)].map((_, i) => <Pulse key={i} className="h-4 w-full" />)}
    </div>
  );
};
