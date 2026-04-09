import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  title, 
  extra, 
  padding = true 
}) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden", className)}>
      {(title || extra) && (
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className={cn(padding ? "p-6" : "")}>
        {children}
      </div>
    </div>
  );
};
