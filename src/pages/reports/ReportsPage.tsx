import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { StatusTag } from '../../components/common/StatusTag';
import { Button, Space, message, Tag, Tooltip } from 'antd';
import { ShieldAlert, CheckCircle, ExternalLink, Flag } from 'lucide-react';

const mockReports = [
  { id: '1', reporter: 'Alice Smith', target: 'John Doe', type: 'Inappropriate Content', reason: 'Using offensive language in matrimony description.', status: 'pending', date: '2024-03-21' },
  { id: '2', reporter: 'Bob Wilson', target: 'Job: Admin Assistant', type: 'Spam', reason: 'Repeatedly posting the same job listing every hour.', status: 'resolved', date: '2024-03-20' },
  { id: '3', reporter: 'Grace Lee', target: 'Comment: Blessed Day', type: 'Harassment', reason: 'Personal attacks in prayer request comments.', status: 'pending', date: '2024-03-19' },
];

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState(mockReports);

  const handleResolve = (id: string) => {
    setData(data.map(item => item.id === id ? { ...item, status: 'resolved' } : item));
    message.success('Report marked as resolved');
  };

  const columns = [
    {
      title: 'Report Details',
      key: 'details',
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{record.type}</span>
            <Tag color="error" className="text-[10px] uppercase font-bold border-none rounded">Urgent</Tag>
          </div>
          <p className="text-xs text-slate-400">Reporter: <span className="text-slate-600">{record.reporter}</span></p>
        </div>
      )
    },
    {
      title: 'Target Content',
      dataIndex: 'target',
      key: 'target',
      render: (text: string) => (
        <div className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline cursor-pointer">
          {text} <ExternalLink size={14} />
        </div>
      )
    },
    { 
      title: 'Reason', 
      dataIndex: 'reason', 
      key: 'reason',
      width: '30%',
      render: (text: string) => <p className="text-slate-600 text-sm italic">"{text}"</p>
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => <StatusTag status={status === 'resolved' ? 'success' : 'pending'} label={status} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Tooltip title="Mark as Resolved">
              <Button 
                type="text" 
                icon={<CheckCircle size={18} className="text-emerald-600" />} 
                onClick={() => handleResolve(record.id)}
                className="hover:bg-emerald-50 flex items-center justify-center p-2 rounded-lg"
              />
            </Tooltip>
          )}
          <Tooltip title="Take Action">
            <Button 
              type="text" 
              icon={<ShieldAlert size={18} className="text-rose-500" />} 
              className="hover:bg-rose-50 flex items-center justify-center p-2 rounded-lg text-rose-500"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Moderation" 
        subtitle="Address reported content and maintain community standards."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center text-white">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-rose-600 text-sm font-medium">Pending Reports</p>
            <h4 className="text-2xl font-bold text-rose-900">12</h4>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-emerald-600 text-sm font-medium">Resolved Today</p>
            <h4 className="text-2xl font-bold text-emerald-900">45</h4>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-white">
            <Flag size={24} />
          </div>
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Flagged</p>
            <h4 className="text-2xl font-bold text-slate-900">1,284</h4>
          </div>
        </div>
      </div>

      <AppTable 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
      />
    </div>
  );
};
