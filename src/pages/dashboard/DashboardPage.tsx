import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  Users, 
  MessageCircle, 
  Briefcase, 
  Heart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

const stats = [
  { label: 'Total Users', value: '12,482', icon: Users, change: '+12%', positive: true, color: 'bg-blue-500' },
  { label: 'Prayer Requests', value: '856', icon: MessageCircle, change: '+5%', positive: true, color: 'bg-emerald-500' },
  { label: 'Job Postings', value: '124', icon: Briefcase, change: '-2%', positive: false, color: 'bg-amber-500' },
  { label: 'Matrimony Profiles', value: '3,150', icon: Heart, change: '+18%', positive: true, color: 'bg-rose-500' },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back, Admin! Here's what's happening today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-none ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
              <div className={cn("p-2 rounded-lg text-white shadow-lg", stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded",
                stat.positive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {stat.positive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                {stat.change}
              </span>
              <span className="text-slate-400 text-xs text-nowrap">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Activity Analytics" className="lg:col-span-2">
          <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="text-center">
              <TrendingUp size={48} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 font-medium italic">Chart visualization would go here</p>
              <p className="text-slate-300 text-xs">Using Chart.js or Recharts</p>
            </div>
          </div>
        </Card>

        <Card title="Recent Notifications">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-snug">New matrimony profile awaiting approval</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
