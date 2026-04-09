import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { Button, Space, message, Avatar, Tooltip } from 'antd';
import { EyeOff, Trash2 } from 'lucide-react';

const mockPrayers = [
  { id: '1', user: 'David Kim', avatar: 'DK', category: 'Healing', message: 'Praying for my mother who is undergoing surgery tomorrow.', date: '2024-03-21' },
  { id: '2', user: 'Maria Garcia', avatar: 'MG', category: 'Family', message: 'Seeking prayers for restoration in my marriage and peace in our home.', date: '2024-03-20' },
  { id: '3', user: 'Samuel Otieno', avatar: 'SO', category: 'Finance', message: 'Trusting God for a breakthrough in my business and financial stability.', date: '2024-03-19' },
  { id: '4', user: 'Grace Lee', avatar: 'GL', category: 'Guidance', message: 'Need clarity on a career decision I have to make soon.', date: '2024-03-18' },
];

export const PrayersPage: React.FC = () => {
  const [data, setData] = useState(mockPrayers);

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    message.success('Prayer request removed');
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-primary-light text-primary font-bold">{record.avatar}</Avatar>
          <span className="font-semibold text-slate-800">{text}</span>
        </div>
      )
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (cat: string) => (
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
          {cat}
        </span>
      )
    },
    { 
      title: 'Message', 
      dataIndex: 'message', 
      key: 'message',
      width: '40%',
      render: (text: string) => <p className="text-slate-600 text-sm line-clamp-2">{text}</p>
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Hide from Public">
            <Button 
              type="text" 
              icon={<EyeOff size={18} className="text-slate-400" />} 
              className="hover:bg-slate-50 flex items-center justify-center"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<Trash2 size={18} />} 
              className="hover:bg-rose-50 flex items-center justify-center border-none"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Prayer Requests" 
        subtitle="Moderate and oversee prayer requests submitted by the community."
      />

      <AppTable 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
      />
    </div>
  );
};
