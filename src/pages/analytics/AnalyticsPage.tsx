import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { BarChart3, TrendingUp, Users, Smartphone, MapPin } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Insights" 
        subtitle="Track application growth, user engagement, and performance metrics."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20">
          <p className="text-white/70 text-sm">Daily Check-ins</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold">2,482</h3>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">+15%</span>
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm">Avg. User Streak</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800">5.4 Days</h3>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm">Total XP Earned</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800">1.2M</h3>
            <span className="text-xs text-slate-400">Lifetime</span>
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm">Active Subscriptions</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800">156</h3>
            <Users size={18} className="text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="User Acquisition" extra={<BarChart3 size={18} className="text-slate-400" />}>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-400 italic">User growth chart would render here</p>
          </div>
        </Card>
        <Card title="Engagement by Platform" extra={<Smartphone size={18} className="text-slate-400" />}>
          <div className="space-y-4">
            {[
              { label: 'iOS App', value: 65, color: 'bg-primary' },
              { label: 'Android App', value: 30, color: 'bg-emerald-500' },
              { label: 'Web Portal', value: 5, color: 'bg-slate-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Top Locations" extra={<MapPin size={18} className="text-slate-400" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {['Nairobi', 'Lagos', 'Accra', 'Kampala', 'Dar es Salaam'].map((city) => (
            <div key={city} className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
              <p className="text-sm font-semibold text-slate-800">{city}</p>
              <p className="text-xs text-slate-500 mt-1">1.2k users</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
