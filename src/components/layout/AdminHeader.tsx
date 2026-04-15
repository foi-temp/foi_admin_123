import React from 'react';
import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { useAdminStore } from '../../store/useAdminStore';
import { useNavigate } from 'react-router-dom';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      message.success('Logged out successfully');
      navigate('/login');
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserIcon size={16} />,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogOut size={16} />,
      danger: true,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 w-full max-w-md">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for something..." 
          className="bg-transparent border-none outline-none text-sm w-full py-0.5 text-slate-600 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" arrow>
          <button className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-lg transition-all group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.full_name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-500">
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </p>
            </div>
            <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold border border-primary/10 group-hover:border-primary/30">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
