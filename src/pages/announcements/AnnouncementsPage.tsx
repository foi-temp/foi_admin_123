import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Divider, 
  Typography,
  Skeleton,
  Popconfirm
} from 'antd';
import { 
  Megaphone, 
  Send, 
  History, 
  Info,
  Sparkles,
  Clock,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { announcementsApi } from '../../api/announcements';
import type { MultiAnnouncementResponse } from '../../api/announcements';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const DENOMINATIONS = [
  'Neutral', 'Catholic', 'Orthodox', 'Evangelical', 'Charismatic', 'Reformed'
].map(d => ({ label: d, value: d }));

export const AnnouncementsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [allLatest, setAllLatest] = useState<MultiAnnouncementResponse>({});
  const [form] = Form.useForm();

  const fetchAllLatest = async () => {
    setFetching(true);
    try {
      const res = await announcementsApi.getAllLatest();
      if (res) {
        setAllLatest(res as unknown as MultiAnnouncementResponse);
      }
    } catch (error) {
      console.error('Failed to fetch latest announcements:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAllLatest();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await announcementsApi.create(values);
      message.success(`Announcement published for ${values.denomination}!`);
      form.resetFields();
      fetchAllLatest();
    } catch (error) {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementsApi.delete(id);
      message.success('Announcement deleted successfully');
      fetchAllLatest();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="App Announcements" 
        subtitle="Manage and view live announcements across all denominations."
        extra={
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl text-amber-700 text-sm font-semibold border border-amber-200">
            <Sparkles size={16} />
            <span>Engage Your Community</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Creation Form - Left Column */}
        <div className="xl:col-span-4 space-y-6">
          <Card title={<div className="flex items-center gap-2"><Megaphone size={18} className="text-primary" /> <span>Publish New Update</span></div>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="mt-2"
              initialValues={{ denomination: 'Neutral' }}
            >
              <Form.Item
                label="Announcement Title"
                name="title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="e.g. New Feature: Community Groups!" className="h-11 rounded-xl" />
              </Form.Item>

              <Form.Item
                label="Subtitle / Description"
                name="subtitle"
                rules={[{ required: true, message: 'Please enter a subtitle' }]}
              >
                <Input.TextArea 
                  placeholder="Tell users what's new in a few words..." 
                  rows={4} 
                  className="rounded-xl p-3 shadow-sm border-slate-200" 
                />
              </Form.Item>

              <Form.Item
                label="Target Denomination"
                name="denomination"
                rules={[{ required: true }]}
              >
                <Select size="large" options={DENOMINATIONS} className="w-full" />
              </Form.Item>

              <Divider className="my-6" />

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Send size={18} />}
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                Publish Announcement
              </Button>
            </Form>
          </Card>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">Operational Info</p>
              Your announcement will be shown prominently on the app home screen for users of the selected denomination.
            </div>
          </div>
        </div>

        {/* Live Denomination State - Right Column */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Title level={4} className="!mb-0">Live Status</Title>
              <Text className="text-slate-400 text-xs">Active announcements per denomination</Text>
            </div>
            <Button 
              type="text" 
              icon={<History size={16} />} 
              onClick={fetchAllLatest}
              className="text-slate-400 hover:text-primary"
            >
              Refresh
            </Button>
          </div>

          {fetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="border-none ring-1 ring-slate-100">
                  <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DENOMINATIONS.map(({ value: den }) => {
                const latest = allLatest[den];
                return (
                  <div key={den} className={cn(
                    "relative rounded-2xl p-5 border transition-all duration-300",
                    latest ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-dashed border-slate-200"
                  )}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", latest ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                        <span className="font-bold text-slate-800 tracking-tight">{den}</span>
                      </div>
                      {latest && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {dayjs(latest.created_at).fromNow()}
                        </span>
                      )}
                    </div>

                    {latest ? (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{latest.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{latest.subtitle}</p>
                        <Divider className="!my-3 !border-slate-50" />
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] text-slate-300 font-medium italic">
                             ID: {latest._id.slice(0, 8)}...
                           </span>
                           <Popconfirm
                             title="Delete this announcement?"
                             description="Users will no longer see this message."
                             onConfirm={() => handleDelete(latest._id)}
                             okText="Delete"
                             cancelText="Cancel"
                             okButtonProps={{ danger: true }}
                           >
                             <Button 
                               type="text" 
                               size="small" 
                               danger
                               icon={<Trash2 size={12} />}
                               className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-rose-50"
                             />
                           </Popconfirm>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center text-slate-300">
                        <Megaphone size={24} className="opacity-20 mb-2" />
                        <span className="text-[11px] font-medium italic">No active announcement</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
