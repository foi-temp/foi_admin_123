import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Heart, 
  Briefcase, 
  MessageCircle, 
  Highlighter, 
  Calendar, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/matrimony', label: 'Matrimony', icon: Heart },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/prayers', label: 'Prayer Requests', icon: MessageCircle },
  { path: '/encouragements', label: 'Encouragements', icon: Highlighter },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/volunteers', label: 'Volunteers', icon: UserCheck },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/reports', label: 'Reports', icon: ShieldAlert },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 flex flex-col z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent truncate">
              Foi Admin
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary-light text-primary font-medium" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon size={20} className={cn(
                "shrink-0",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
              )} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-slate-50 text-slate-400 hover:text-primary transition-colors flex justify-center"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
};
