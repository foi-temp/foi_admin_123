import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  Users, 
  MessageCircle, 
  Briefcase, 
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { dashboardApi } from '../../api/dashboard';
import type { DashboardResponse } from '../../api/dashboard';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import dayjs from 'dayjs';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getDashboardData();
        if (response.status) {
          setData(response as unknown as DashboardResponse);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-500 font-medium">Loading real-time insights...</p>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Users', 
      value: data?.users.total.toLocaleString() || '0', 
      icon: Users, 
      change: `${data?.users.growth}%`, 
      positive: (data?.users.growth || 0) >= 0, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Prayer Requests', 
      value: data?.prayers.total.toLocaleString() || '0', 
      icon: MessageCircle, 
      change: `${data?.prayers.growth}%`, 
      positive: (data?.prayers.growth || 0) >= 0, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Job Postings', 
      value: data?.jobs.total.toLocaleString() || '0', 
      icon: Briefcase, 
      change: `${data?.jobs.growth}%`, 
      positive: (data?.jobs.growth || 0) >= 0, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Matrimony Profiles', 
      value: data?.matrimony.total.toLocaleString() || '0', 
      icon: Heart, 
      change: `${data?.matrimony.growth}%`, 
      positive: (data?.matrimony.growth || 0) >= 0, 
      color: 'bg-rose-500' 
    },
  ];

  const chartData = data?.activity_analytics.map(item => ({
    ...item,
    formattedDate: dayjs(item.date).format('MMM DD')
  })) || [];

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
              <span className="text-slate-400 text-xs text-nowrap">vs last period</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Activity Analytics" className="border-none ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrayers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMatrimony" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="formattedDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  name="Users"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="prayers" 
                  name="Prayers"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrayers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="jobs" 
                  name="Jobs"
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorJobs)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="matrimony" 
                  name="Matrimony"
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMatrimony)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
