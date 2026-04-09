import React from 'react';
import { cn } from '../../utils/cn';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active' | 'inactive';

interface StatusTagProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  error: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  inactive: { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500' },
  info: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
};

export const StatusTag: React.FC<StatusTagProps> = ({ status, label, className }) => {
  const lowerStatus = status.toLowerCase();
  const config = statusConfig[lowerStatus] || statusConfig.info;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent transition-all duration-200",
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
