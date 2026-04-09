import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { StatusTag } from '../../components/common/StatusTag';
import { Button, Space, message, Avatar, Input } from 'antd';
import { UserX, UserCheck, Shield, Search } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'Mark Spencer', email: 'mark@example.com', role: 'User', status: 'active', joined: '2023-10-15' },
  { id: '2', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'Moderator', status: 'active', joined: '2023-11-20' },
  { id: '3', name: 'Paul Peterson', email: 'paul@example.com', role: 'User', status: 'blocked', joined: '2023-12-05' },
  { id: '4', name: 'Emma Watson', email: 'emma@example.com', role: 'User', status: 'active', joined: '2024-01-10' },
];

export const UsersPage: React.FC = () => {
  const [data, setData] = useState(mockUsers);

  const toggleBlock = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setData(data.map(user => user.id === id ? { ...user, status: newStatus } : user));
    message.success(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-primary/10 text-primary uppercase">{record.name.charAt(0)}</Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{record.name}</span>
            <span className="text-xs text-slate-400">{record.email}</span>
          </div>
        </div>
      )
    },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          {role === 'Moderator' && <Shield size={14} className="text-amber-500" />}
          <span>{role}</span>
        </div>
      )
    },
    { title: 'Joined Date', dataIndex: 'joined', key: 'joined' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => <StatusTag status={status} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={record.status === 'active' ? <UserX size={18} className="text-rose-500" /> : <UserCheck size={18} className="text-emerald-500" />} 
            onClick={() => toggleBlock(record.id, record.status)}
            className={record.status === 'active' ? "hover:bg-rose-50" : "hover:bg-emerald-50"}
          >
            {record.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        subtitle="Manage user accounts, roles, and access permissions."
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 mb-4">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search by name or email..." className="pl-10 h-10 rounded-lg" />
        </div>
        <Button className="h-10 rounded-lg">Export CSV</Button>
      </div>

      <AppTable 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
      />
    </div>
  );
};
