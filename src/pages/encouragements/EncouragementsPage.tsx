import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { Button, Space, message } from 'antd';
import { Trash2, Quote } from 'lucide-react';

const mockMessages = [
  { id: '1', user: 'Pastor Chris', message: 'God is doing a new thing in your life today. Do not be afraid!', date: '2024-03-21' },
  { id: '2', user: 'Sister Rose', message: 'The steadfast love of the Lord never ceases; His mercies never come to an end.', date: '2024-03-20' },
  { id: '3', user: 'Brother Sam', message: 'Keep pressing on towards the goal. Your labor is not in vain.', date: '2024-03-19' },
];

export const EncouragementsPage: React.FC = () => {
  const [data, setData] = useState(mockMessages);

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    message.success('Message deleted');
  };

  const columns = [
    {
      title: 'Author',
      dataIndex: 'user',
      key: 'user',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Quote size={16} className="text-primary" />
          <span className="font-semibold text-slate-800">{text}</span>
        </div>
      )
    },
    { 
      title: 'Message', 
      dataIndex: 'message', 
      key: 'message',
      render: (text: string) => <span className="text-slate-600 text-sm">"{text}"</span>
    },
    { title: 'Posted On', dataIndex: 'date', key: 'date' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
            onClick={() => handleDelete(record.id)}
            className="hover:bg-rose-50 flex items-center justify-center border-none"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Encouraging Messages" 
        subtitle="Review and manage daily inspirations and encouragements."
      />

      <AppTable 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
      />
    </div>
  );
};
