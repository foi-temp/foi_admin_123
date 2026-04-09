import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { StatusTag } from '../../components/common/StatusTag';
import { Button, Space, message, Input, Tag } from 'antd';
import { Search, Briefcase } from 'lucide-react';

const mockJobs = [
  { id: '1', title: 'Sunday School Teacher', company: 'Grace Cathedral', type: 'Volunteer', status: 'pending', posted: '2024-03-20' },
  { id: '2', title: 'Worship Leader', company: 'Community Church', type: 'Full-time', status: 'approved', posted: '2024-03-18' },
  { id: '3', title: 'Admin Assistant', company: 'Mercy Ministry', type: 'Part-time', status: 'pending', posted: '2024-03-19' },
  { id: '4', title: 'Youth Pastor', company: 'Victory Center', type: 'Full-time', status: 'rejected', posted: '2024-03-15' },
];

export const JobsPage: React.FC = () => {
  const [data, setData] = useState(mockJobs);
  const [loading, setLoading] = useState(false);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    setTimeout(() => {
      setData(data.map(item => item.id === id ? { ...item, status } : item));
      message.success(`Job ${status} successfully`);
      setLoading(false);
    }, 600);
  };

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Briefcase size={16} />
          </div>
          <span className="font-semibold text-slate-800">{text}</span>
        </div>
      ),
    },
    { title: 'Organization', dataIndex: 'company', key: 'company' },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => <Tag className="rounded-full px-3">{type}</Tag>
    },
    { title: 'Posted Date', dataIndex: 'posted', key: 'posted' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                className="bg-primary border-none flex items-center gap-1"
                onClick={() => handleAction(record.id, 'approved')}
              >
                Approve
              </Button>
              <Button 
                danger 
                size="small"
                className="flex items-center gap-1"
                onClick={() => handleAction(record.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Job Opportunities" 
        subtitle="Review and moderate job postings from ministries."
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search jobs, organizations..." 
            className="pl-10 h-10 rounded-lg border-transparent bg-slate-50 hover:bg-slate-100 focus:bg-white transition-all"
          />
        </div>
      </div>

      <AppTable 
        columns={columns} 
        dataSource={data} 
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};
