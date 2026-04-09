import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { Button, Space, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';

const { Option } = Select;

const mockEvents = [
  { id: '1', title: 'Easter Sunday Service', date: '2024-03-31', location: 'Main Sanctuary', type: 'Service' },
  { id: '2', title: 'Youth Night Out', date: '2024-04-05', location: 'Church Hall', type: 'Youth' },
  { id: '3', title: 'Couples Seminar', date: '2024-04-12', location: 'Conference Room', type: 'Seminar' },
];

export const EventsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [data, setData] = useState(mockEvents);

  const showModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      const formattedValues = {
        ...values,
        id: editingId || Math.random().toString(36).substr(2, 9),
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        setData(data.map(item => item.id === editingId ? formattedValues : item));
        message.success('Event updated successfully');
      } else {
        setData([...data, formattedValues]);
        message.success('Event created successfully');
      }
      setIsModalOpen(false);
    });
  };

  const columns = [
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <CalendarIcon size={16} />
          </div>
          <span className="font-semibold text-slate-800">{text}</span>
        </div>
      ),
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => (
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{type}</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 size={16} className="text-slate-400" />} 
            onClick={() => showModal(record)}
            className="hover:bg-slate-50 flex items-center justify-center"
          />
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
            onClick={() => setData(data.filter(i => i.id !== record.id))}
            className="hover:bg-rose-50 flex items-center justify-center border-none"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Events" 
        subtitle="Schedule and manage upcoming church events and activities."
        extra={
          <Button 
            type="primary" 
            icon={<Plus size={16} />} 
            onClick={() => showModal()}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary border-none shadow-md shadow-primary/20"
          >
            Create Event
          </Button>
        }
      />

      <AppTable 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
      />

      <Modal
        title={editingId ? "Edit Event" : "Create New Event"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? "Update" : "Create"}
        cancelText="Cancel"
        className="modern-modal"
        centered
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
            <Input placeholder="Enter event title" className="rounded-lg h-10" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker className="w-full rounded-lg h-10" />
            </Form.Item>
            <Form.Item name="type" label="Event Type" rules={[{ required: true }]}>
              <Select placeholder="Select type" className="h-10">
                <Option value="Service">Service</Option>
                <Option value="Youth">Youth</Option>
                <Option value="Seminar">Seminar</Option>
                <Option value="Social">Social</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input placeholder="Enter location" className="rounded-lg h-10" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
