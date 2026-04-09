import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { StatusTag } from '../../components/common/StatusTag';
import { Button, Space, Tabs, Tag, message } from 'antd';
import { Users, ClipboardList, Check, X } from 'lucide-react';

const mockOpportunities = [
  { id: '1', title: 'Food Drive Organizer', department: 'Outreach', spots: 5, status: 'open' },
  { id: '2', title: 'IT Support', department: 'Admin', spots: 2, status: 'closed' },
  { id: '3', title: 'Youth Mentor', department: 'Youth', spots: 10, status: 'open' },
];

const mockApplicants = [
  { id: '1', name: 'John Peterson', opportunity: 'Food Drive Organizer', status: 'pending', date: '2024-03-21' },
  { id: '2', name: 'Maria Santos', opportunity: 'IT Support', status: 'approved', date: '2024-03-20' },
  { id: '3', name: 'Kevin Hart', opportunity: 'Youth Mentor', status: 'pending', date: '2024-03-19' },
];

export const VolunteersPage: React.FC = () => {
  const [applicants, setApplicants] = useState(mockApplicants);

  const handleApplyAction = (id: string, status: 'approved' | 'rejected') => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, status } : a));
    message.success(`Applicant ${status} successfully`);
  };

  const opportunityColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (text: string) => <span className="font-semibold">{text}</span> },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Open Spots', dataIndex: 'spots', key: 'spots' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'open' ? 'green' : 'red'}>{status.toUpperCase()}</Tag> },
  ];

  const applicantColumns = [
    { title: 'Applicant Name', dataIndex: 'name', key: 'name', render: (text: string) => <span className="font-semibold">{text}</span> },
    { title: 'Opportunity', dataIndex: 'opportunity', key: 'opportunity' },
    { title: 'Applied Date', dataIndex: 'date', key: 'date' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <StatusTag status={status} /> },
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
                onClick={() => handleApplyAction(record.id, 'approved')}
                className="hover:bg-emerald-50"
              />
              <Button 
                type="text" 
                icon={<X size={18} className="text-rose-600" />} 
                onClick={() => handleApplyAction(record.id, 'rejected')}
                className="hover:bg-rose-50"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Volunteer Management" 
        subtitle="Manage opportunities and review volunteer applications."
      />

      <Tabs 
        defaultActiveKey="opportunities"
        className="modern-tabs"
        items={[
          {
            key: 'opportunities',
            label: (
              <div className="flex items-center gap-2">
                <ClipboardList size={18} />
                <span>Opportunities</span>
              </div>
            ),
            children: <AppTable columns={opportunityColumns} dataSource={mockOpportunities} rowKey="id" />,
          },
          {
            key: 'applicants',
            label: (
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>Applicants</span>
                <Tag color="blue" className="ml-1 rounded-full">{applicants.filter(a => a.status === 'pending').length}</Tag>
              </div>
            ),
            children: <AppTable columns={applicantColumns} dataSource={applicants} rowKey="id" />,
          },
        ]}
      />
    </div>
  );
};
