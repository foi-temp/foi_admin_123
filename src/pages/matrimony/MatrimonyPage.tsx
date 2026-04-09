import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { StatusTag } from '../../components/common/StatusTag';
import { Button, Space, Modal, message, Input, Select } from 'antd';
import { Check, X, Trash2, Search, Filter } from 'lucide-react';

const mockData = [
  { id: '1', name: 'John Doe', age: 28, church: 'Grace Community', status: 'pending', city: 'Nairobi' },
  { id: '2', name: 'Jane Smith', age: 25, church: 'Victory Bible Church', status: 'approved', city: 'Mombasa' },
  { id: '3', name: 'James Wilson', age: 31, church: 'Holy Spirit Parish', status: 'rejected', city: 'Kisumu' },
  { id: '4', name: 'Sarah Parker', age: 27, church: 'Grace Community', status: 'pending', city: 'Nakuru' },
  { id: '5', name: 'Robert Brown', age: 33, church: 'Redeemed Christian', status: 'approved', city: 'Eldoret' },
];

export const MatrimonyPage: React.FC = () => {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  const handleAction = (id: string, action: 'approve' | 'reject' | 'delete') => {
    Modal.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Profile`,
      content: `Are you sure you want to ${action} this matrimony profile?`,
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: { 
        danger: action !== 'approve',
        className: action === 'approve' ? 'bg-emerald-600 border-none' : ''
      },
      onOk: () => {
        setLoading(true);
        setTimeout(() => {
          if (action === 'delete') {
            setData(data.filter(item => item.id !== id));
            message.success('Profile deleted successfully');
          } else {
            setData(data.map(item => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' } : item));
            message.success(`Profile ${action}d successfully`);
          }
          setLoading(false);
        }, 800);
      }
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-slate-800">{text}</span>,
    },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Church', dataIndex: 'church', key: 'church' },
    { title: 'City', dataIndex: 'city', key: 'city' },
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
                type="text" 
                icon={<Check size={18} className="text-emerald-600" />} 
                className="hover:bg-emerald-50 rounded-lg flex items-center justify-center"
                onClick={() => handleAction(record.id, 'approve')}
              />
              <Button 
                type="text" 
                icon={<X size={18} className="text-amber-600" />} 
                className="hover:bg-amber-50 rounded-lg flex items-center justify-center"
                onClick={() => handleAction(record.id, 'reject')}
              />
            </>
          )}
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={18} />} 
            className="hover:bg-rose-50 rounded-lg flex items-center justify-center border-none"
            onClick={() => handleAction(record.id, 'delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Matrimony Management" 
        subtitle="Review and manage matrimony profile approvals."
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search profiles by name or church..." 
            className="pl-10 h-10 rounded-lg border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Select 
            defaultValue="all" 
            className="w-36 h-10"
            style={{ height: 40 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <Button icon={<Filter size={16} />} className="h-10 px-4 rounded-lg flex items-center gap-2">
            Filters
          </Button>
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
