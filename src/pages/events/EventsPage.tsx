import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { Button, Space, Modal, Form, Input, DatePicker, Select, message, Tag, Tooltip, Empty, Checkbox, InputNumber, Divider } from 'antd';
import { Plus, Edit2, Calendar as CalendarIcon, MapPin, Search, Loader2, Filter, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { eventsApi } from '../../api/events';
import { commonApi } from '../../api/common';
import type { EventResponse } from '../../api/events';
import type { LocationSuggestion } from '../../api/common';

const { TextArea } = Input;

const DENOMINATIONS = [
  'Neutral', 'Catholic', 'Orthodox', 'Evangelical', 'Charismatic', 'Reformed'
].map(d => ({ label: d, value: d }));

const CATEGORIES = [
  'Prayer', 'Service', 'Youth', 'Seminar', 'Social', 'Other'
].map(c => ({ label: c, value: c }));

export const EventsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [data, setData] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Search & Filter state
  const [locationOptions, setLocationOptions] = useState<LocationSuggestion[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterDenomination, setFilterDenomination] = useState<string | undefined>(undefined);

  const searchTimer = useRef<any>(null);
  const filterTimer = useRef<any>(null);

  // Watch for volunteer checkbox
  const needVolunteers = Form.useWatch('need_volunteers', form);

  const fetchEvents = async (
    search = searchText, 
    date = filterDate, 
    cat = filterCategory, 
    den = filterDenomination
  ) => {
    setLoading(true);
    try {
      const res: any = await eventsApi.listEvents(1, 100, search, date || undefined, cat, den);
      if (res.status) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const updateFilters = (
    search: string, 
    date: string | null, 
    cat?: string, 
    den?: string
  ) => {
    setSearchText(search);
    setFilterDate(date);
    setFilterCategory(cat);
    setFilterDenomination(den);

    if (filterTimer.current) {
      clearTimeout(filterTimer.current);
    }

    filterTimer.current = setTimeout(() => {
      fetchEvents(search, date, cat, den);
    }, 500);
  };

  const showModal = (record?: EventResponse) => {
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue({
        ...record,
        date_time: dayjs(record.date_time),
        latitude: record.location?.latitude || 0,
        longitude: record.location?.longitude || 0,
        location_address: record.location_address,
        volunteer_details: record.volunteer_details ? {
          ...record.volunteer_details,
          deadline: dayjs(record.volunteer_details.deadline)
        } : undefined
      });
      setLocationOptions([{ description: record.location_address, place_id: 'initial' }]);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        latitude: 0,
        longitude: 0,
        denomination: 'Neutral',
        category: 'Other',
        need_volunteers: false
      });
      setLocationOptions([]);
    }
    setIsModalOpen(true);
  };

  const handleLocationSearch = (val: string) => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    if (!val || val.length < 3) {
      setLocationOptions([]);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const res: any = await commonApi.autocomplete(val);
        if (res.status) {
          setLocationOptions(res.data);
        }
      } catch (error) {
        console.error('Location search failed:', error);
      } finally {
        setSearchingLocation(false);
      }
    }, 500);
  };

  const handleLocationSelect = async (_: string, option: any) => {
    if (option.key === 'initial') return;

    try {
      const res: any = await commonApi.getLocationDetails(option.key);
      if (res.status) {
        form.setFieldsValue({
          location_address: res.data.address,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
        });
      }
    } catch (error) {
      message.error('Failed to get location details');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const payload: any = {
        title: values.title,
        category: values.category,
        description: values.description,
        date_time: values.date_time.toISOString(),
        location_address: values.location_address,
        location: {
          latitude: Number(values.latitude) || 0,
          longitude: Number(values.longitude) || 0,
        },
        denomination: values.denomination,
        need_volunteers: !!values.need_volunteers,
      };

      if (values.need_volunteers && values.volunteer_details) {
        payload.volunteer_details = {
          required_volunteers: values.volunteer_details.required_volunteers,
          roles: values.volunteer_details.roles,
          deadline: values.volunteer_details.deadline.toISOString(),
        };
      }

      if (editingId) {
        const res: any = await eventsApi.updateEvent(editingId, payload);
        if (res.status) {
          message.success(res.message || 'Event updated successfully');
          fetchEvents();
        }
      } else {
        const res: any = await eventsApi.createEvent(payload);
        if (res.status) {
          message.success('Event created successfully');
          fetchEvents();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Event details',
      key: 'details',
      render: (_: any, record: EventResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
            <CalendarIcon size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{record.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{record.category}</span>
              {record.need_volunteers && (
                <Tag color="cyan" className="text-[10px] uppercase font-bold border-none px-1.5 py-0 leading-none h-4">
                  Needs Help
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    { 
      title: 'Date & Time', 
      dataIndex: 'date_time', 
      key: 'date_time',
      render: (date: string) => (
        <div className="text-sm">
          <p className="font-medium text-slate-700">{dayjs(date).format('MMM DD, YYYY')}</p>
          <p className="text-xs text-slate-400">{dayjs(date).format('hh:mm A')}</p>
        </div>
      )
    },
    { 
      title: 'Location', 
      dataIndex: 'location_address', 
      key: 'location_address',
      render: (addr: string) => (
        <div className="flex items-center gap-1.5 text-slate-600 max-w-[200px]">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          <span className="text-xs truncate">{addr}</span>
        </div>
      )
    },
    { 
      title: 'Denomination', 
      dataIndex: 'denomination', 
      key: 'denomination',
      render: (den: string) => (
        <Tag className="rounded-full px-3 py-0.5 border-none bg-slate-100 text-slate-600 font-medium text-[11px]">
          {den}
        </Tag>
      )
    },
    { 
      title: 'Going', 
      dataIndex: 'going_count', 
      key: 'going_count',
      render: (count: number) => (
        <div className="flex items-center gap-1 text-slate-600 font-semibold">
          <span className="text-primary">{count}</span>
          <span className="text-[10px] text-slate-400 font-normal">Going</span>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: EventResponse) => (
        <Space size="middle">
          <Tooltip title="Edit Event">
            <Button 
              type="text" 
              icon={<Edit2 size={18} className="text-slate-400" />} 
              onClick={() => showModal(record)}
              className="hover:bg-slate-50 flex items-center justify-center p-2 rounded-lg"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Events Management" 
        subtitle="Schedule and manage upcoming faith-based events and activities."
        extra={
          <Button 
            type="primary" 
            icon={<Plus size={18} />} 
            onClick={() => showModal()}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary border-none shadow-lg shadow-primary/20 font-bold"
          >
            Create Event
          </Button>
        }
      />

      <div className="bg-white p-5 rounded-xl border border-slate-100 mb-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search events by title or location..." 
              className="pl-10 h-11 rounded-xl border-slate-200"
              allowClear
              value={searchText}
              onChange={(e) => updateFilters(e.target.value, filterDate, filterCategory, filterDenomination)}
            />
          </div>
          <div className="w-full md:w-56">
            <DatePicker 
              className="h-11 rounded-xl w-full border-slate-200" 
              placeholder="Select date"
              onChange={(_, dateStr) => updateFilters(searchText, dateStr as string, filterCategory, filterDenomination)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filters:</span>
          </div>

          <Select 
            placeholder="All Categories" 
            className="h-9 w-40 custom-select-small" 
            allowClear
            options={CATEGORIES}
            onChange={(val) => updateFilters(searchText, filterDate, val, filterDenomination)}
          />

          <Select 
            placeholder="All Denominations" 
            className="h-9 w-44 custom-select-small" 
            allowClear
            options={DENOMINATIONS}
            onChange={(val) => updateFilters(searchText, filterDate, filterCategory, val)}
          />

          {(searchText || filterDate || filterCategory || filterDenomination) && (
            <Button 
              type="text" 
              size="small" 
              className="text-primary text-xs font-semibold hover:bg-primary-light"
              onClick={() => {
                setSearchText('');
                setFilterDate(null);
                setFilterCategory(undefined);
                setFilterDenomination(undefined);
                fetchEvents('', null, undefined, undefined);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <AppTable 
        columns={columns} 
        dataSource={data} 
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={
          <div className="flex items-center gap-2 pb-2">
            <div className="p-2 bg-primary-light rounded-lg text-primary">
              <CalendarIcon size={20} />
            </div>
            <span className="text-lg font-bold">{editingId ? "Edit Event" : "Create New Event"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText={editingId ? "Update Event" : "Create Event"}
        cancelText="Cancel"
        width={700}
        className="modern-modal"
        centered
      >
        <Form form={form} layout="vertical" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item name="title" label="Event Title" rules={[{ required: true, message: 'Please enter title' }]}>
              <Input placeholder="Enter title" className="rounded-xl h-11" allowClear />
            </Form.Item>
            
            <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select category' }]}>
              <Select placeholder="Select category" className="h-11 custom-select" options={CATEGORIES} />
            </Form.Item>

            <Form.Item name="date_time" label="Date & Time" rules={[{ required: true, message: 'Please select date' }]}>
              <DatePicker minDate={dayjs()} showTime className="w-full rounded-xl h-11" format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item name="denomination" label="Denomination" rules={[{ required: true, message: 'Please select denomination' }]}>
              <Select placeholder="Select denomination" className="h-11 custom-select" options={DENOMINATIONS} />
            </Form.Item>
          </div>

          <Form.Item name="location_address" label="Location Address" rules={[{ required: true, message: 'Please search and select a location' }]}>
            <Select
              showSearch
              placeholder="Search for a location (e.g. Kunnamkulam)"
              className="h-11 custom-select"
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={handleLocationSearch}
              onSelect={handleLocationSelect}
              suffixIcon={searchingLocation ? <Loader2 size={16} className="animate-spin text-primary" /> : <MapPin size={18} className="text-slate-400" />}
              notFoundContent={searchingLocation ? <div className="p-4 text-center"><Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" /><p className="text-xs text-slate-400">Searching locations...</p></div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No results found" />}
            >
              {locationOptions.map(opt => (
                <Select.Option key={opt.place_id} value={opt.description}>
                  <div className="flex items-center gap-2 py-1">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{opt.description}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="latitude" noStyle><Input type="hidden" /></Form.Item>
          <Form.Item name="longitude" noStyle><Input type="hidden" /></Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
            <TextArea rows={4} placeholder="Describe the event..." className="rounded-xl p-3" allowClear />
          </Form.Item>

          <Divider className="!mb-6">
            <div className="flex items-center gap-2 text-slate-500 italic">
              <Users size={16} />
              <span className="text-sm">Volunteer Requirements</span>
            </div>
          </Divider>

          <Form.Item name="need_volunteers" valuePropName="checked">
            <Checkbox className="text-slate-600 font-medium">Require volunteers for this event?</Checkbox>
          </Form.Item>

          {needVolunteers && (
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 mt-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item 
                  name={['volunteer_details', 'required_volunteers']} 
                  label="Number of Volunteers Needed" 
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={1} placeholder="e.g. 10" className="w-full rounded-xl h-11 flex items-center" />
                </Form.Item>

                <Form.Item 
                  name={['volunteer_details', 'deadline']} 
                  label="Application Deadline" 
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <DatePicker 
                    minDate={dayjs()} 
                    className="w-full rounded-xl h-11" 
                    placeholder="Deadline date" 
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </div>

              <Form.Item 
                name={['volunteer_details', 'roles']} 
                label="Volunteer Roles" 
                rules={[{ required: true, message: 'At least one role is required' }]}
                extra="Type a role and press Enter (e.g. Usher, Singer, Security)"
              >
                <Select 
                  mode="tags" 
                  placeholder="Add roles..." 
                  className="rounded-xl w-full"
                  tokenSeparators={[',']}
                  style={{ minHeight: '44px' }}
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};
