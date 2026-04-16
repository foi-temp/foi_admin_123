import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import { Card } from '../../components/common/Card';
import { 
  Button, 
  message, 
  Tag, 
  Tabs, 
  Avatar, 
  Modal, 
  Badge,
  Typography,
  Popconfirm
} from 'antd';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Eye, 
  Flag, 
  AlertTriangle,
  Clock,
  User,
  Target
} from 'lucide-react';
import dayjs from 'dayjs';
import { reportsApi } from '../../api/reports';
import type { GroupedReport } from '../../api/reports';
import { prayersApi } from '../../api/prayers';
import { jobsApi } from '../../api/jobs';
import { matrimonyApi } from '../../api/matrimony';
import { usersApi } from '../../api/users';
import { cn } from '../../utils/cn';

const { Title } = Typography;

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [reportsData, setReportsData] = useState<GroupedReport[]>([]);
  const [stats, setStats] = useState({ pending: 0, resolved: 0 });
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupedReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchReports = useCallback(async (pg = page, status = activeTab) => {
    setLoading(true);
    try {
      const res = await reportsApi.getGroupedReports({ page: pg, limit: 10, status }) as any;
      if (res && res.status) {
        setReportsData(res.data || []);
        setStats({
          pending: res.pending_count || 0,
          resolved: res.resolved_count || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleBulkStatusUpdate = async (status: 'resolved' | 'dismissed') => {
    if (!selectedGroup) return;
    
    const pendingIds = selectedGroup.reports
      .filter(r => r.status === 'pending')
      .map(r => r.id);

    if (pendingIds.length === 0) {
      message.info('No pending reports to update');
      return;
    }

    try {
      await reportsApi.bulkUpdateReportStatus(pendingIds, status);
      message.success(`${pendingIds.length} reports marked as ${status}`);
      
      // Update local state
      const updatedReports = selectedGroup.reports.map(r => 
        pendingIds.includes(r.id) ? { ...r, status } : r
      );
      setSelectedGroup({ ...selectedGroup, reports: updatedReports });
      
      fetchReports();
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDeleteTarget = async () => {
    if (!selectedGroup) return;
    const { id, type } = selectedGroup.target;

    try {
      setLoading(true);
      // Delete based on type
      if (type === 'prayer') await prayersApi.deletePrayer(id);
      else if (type === 'job') await jobsApi.deleteJob(id);
      else if (type === 'matrimony') await matrimonyApi.deleteProfile(id);
      else if (type === 'user') await usersApi.deleteUser(id);
      else {
        message.error(`Unknown target type: ${type}`);
        return;
      }

      // If delete succeeds, bulk resolve all associated reports
      const pendingIds = selectedGroup.reports
        .filter(r => r.status === 'pending')
        .map(r => r.id);

      if (pendingIds.length > 0) {
        await reportsApi.bulkUpdateReportStatus(pendingIds, 'resolved');
      }

      message.success('Content deleted and reports resolved successfully');
      setIsDetailModalOpen(false);
      fetchReports();
    } catch (error) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const showDetails = (group: GroupedReport) => {
    setSelectedGroup(group);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      title: 'Reported Content',
      key: 'content',
      render: (_: any, record: GroupedReport) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
            {record.target.image ? (
              <img src={record.target.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Target size={24} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-slate-800 tracking-tight">{record.target.display_name}</span>
              <Tag className="rounded-full text-[9px] px-2 py-0 border-none bg-indigo-50 text-indigo-500 font-bold uppercase">
                {record.target.type}
              </Tag>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 italic">"{record.target.description}"</p>
          </div>
        </div>
      )
    },
    {
      title: 'Reports',
      dataIndex: 'report_count',
      key: 'report_count',
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
            {count}
          </div>
          <span className="text-xs font-medium text-slate-500">Flags</span>
        </div>
      )
    },
    {
      title: 'Latest Reason',
      key: 'reason',
      render: (_: any, record: GroupedReport) => {
        const latest = record.reports[0];
        return (
          <div className="max-w-xs">
            <Tag className="mb-1 text-[10px] font-bold border-none bg-rose-50 text-rose-600 rounded">
              {latest.reason}
            </Tag>
            <p className="text-xs text-slate-400 line-clamp-1">{latest.comment}</p>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: GroupedReport) => (
        <Button 
          type="primary" 
          icon={<Eye size={16} />} 
          onClick={() => showDetails(record)}
          className="h-9 rounded-xl flex items-center gap-2 shadow-sm font-semibold"
        >
          Review
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Moderation Center" 
        subtitle="Review and take action on reported community content."
        extra={
            <div className="flex gap-2">
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Last update: {dayjs().format('hh:mm A')}</span>
                </div>
            </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModerationStat 
            title="Pending Items" 
            value={stats.pending} 
            icon={<AlertTriangle size={20} />} 
            color="rose" 
            subText="Requires immediate attention"
        />
        <ModerationStat 
            title="Resolved" 
            value={stats.resolved} 
            icon={<CheckCircle size={20} />} 
            color="emerald" 
            subText="Actions taken overall"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={(k) => {
            setActiveTab(k);
            setPage(1);
          }}
          className="px-6 pt-2"
          items={[
            {
              key: 'pending',
              label: (
                <div className="flex items-center gap-2 py-2">
                  <span>Pending Review</span>
                  {stats.pending > 0 && <Badge count={stats.pending} style={{ backgroundColor: '#ef4444' }} overflowCount={99} className="scale-75" />}
                </div>
              )
            },
            {
              key: 'resolved',
              label: <div className="py-2">Resolved</div>
            }
          ]}
        />

        <div className="p-0">
          <AppTable 
            columns={columns} 
            dataSource={reportsData} 
            loading={loading}
            rowKey={(r) => r.target.id}
            pagination={{
              current: page,
              pageSize: 10,
              total: activeTab === 'pending' ? stats.pending : stats.resolved,
              onChange: (p) => setPage(p)
            }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={null}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
        centered
        className="reports-modal"
        bodyStyle={{ padding: 0 }}
      >
        {selectedGroup && (
          <div className="flex flex-col h-[80vh]">
            {/* Modal Header */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
                    {selectedGroup.target.image ? (
                       <img src={selectedGroup.target.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                       <Flag size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="m-0 border-none bg-primary/10 text-primary font-bold text-[10px] uppercase">{selectedGroup.target.type}</Tag>
                      <span className="text-[10px] font-bold text-slate-400">ID: {selectedGroup.target.id}</span>
                    </div>
                    <Title level={3} className="!mb-0">{selectedGroup.target.display_name}</Title>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Reports</p>
                  <p className="text-3xl font-black text-rose-500 leading-none">{selectedGroup.report_count}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm italic text-slate-600 relative">
                 <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 border border-slate-100 rounded-full">Reported Description</span>
                 "{selectedGroup.target.description}"
              </div>
            </div>

            {/* Individual Reports Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                Individual Flags
              </Title>

              {selectedGroup.reports.map((report, idx) => (
                <div key={report.id} className="relative group">
                   {idx !== selectedGroup.reports.length -1 && (
                     <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-100 -mb-6" />
                   )}
                   
                   <div className="relative flex gap-4 bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all">
                      <Avatar className="bg-slate-100 text-slate-400 shrink-0" icon={<User size={18} />} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-slate-800">Reporter: {report.reporter_id.slice(0, 8)}...</p>
                            <span className="text-[10px] text-slate-400 font-medium">{dayjs(report.created_at).format('MMM DD, YYYY [at] hh:mm A')}</span>
                          </div>
                          <Tag className={cn("m-0 border-none font-bold text-[10px] uppercase py-0.5 px-2 rounded-full",
                            report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                            report.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          )}>
                            {report.status}
                          </Tag>
                        </div>

                        <div className="mb-3">
                           <Tag className="rounded-md bg-rose-50 text-rose-600 border-none font-bold text-[10px] mb-2">{report.reason}</Tag>
                           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-50">
                             {report.comment}
                           </p>
                        </div>

                        {/* Individual resolve/dismiss buttons removed as per user request */}
                      </div>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3 flex-wrap">
               <Button size="large" className="rounded-xl px-8" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
               
               {selectedGroup.reports.some(r => r.status === 'pending') && (
                 <>
                   <Button 
                     size="large" 
                     className="rounded-xl px-6 border-slate-200 text-slate-500 hover:text-slate-700 font-semibold" 
                     icon={<XCircle size={18} />}
                     onClick={() => handleBulkStatusUpdate('dismissed')}
                   >
                     Dismiss All
                   </Button>
                   
                   <Button 
                     type="primary" 
                     size="large" 
                     className="rounded-xl px-10 bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 font-bold" 
                     icon={<CheckCircle size={18} />}
                     onClick={() => handleBulkStatusUpdate('resolved')}
                   >
                     Resolve All
                   </Button>

                   <Popconfirm
                     title="Permanently Delete Content?"
                     description="This action cannot be undone. All reports will be marked as resolved."
                     onConfirm={handleDeleteTarget}
                     okText="Delete"
                     cancelText="Cancel"
                     okButtonProps={{ danger: true, loading }}
                   >
                     <Button 
                       danger
                       type="primary"
                       size="large" 
                       className="rounded-xl px-10 shadow-lg shadow-rose-200 font-bold" 
                       icon={<ShieldAlert size={18} />}
                     >
                       Delete Content
                     </Button>
                   </Popconfirm>
                 </>
               )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ModerationStat: React.FC<{ title: string; value: number; icon: React.ReactNode; color: 'rose' | 'emerald'; subText: string }> = ({ title, value, icon, color, subText }) => {
    const isRose = color === 'rose';
    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    isRose ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                )}>
                    {icon}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</span>
                    <Title level={2} className="!mb-0 !mt-1 tracking-tighter">{value.toLocaleString()}</Title>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isRose ? "bg-rose-500" : "bg-emerald-500")} />
                <span className="text-[11px] font-medium text-slate-500">{subText}</span>
            </div>
        </Card>
    );
}
