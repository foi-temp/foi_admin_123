import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import {
  Button, Space, Modal, Input, DatePicker, Select,
  message, Tag, Tooltip, Popconfirm, Badge, Divider
} from 'antd';
import {
  Briefcase, Check, X, Filter, Search, MapPin,
  Mail, Phone, Link, Clock, DollarSign, Wifi, Building2, ChevronRight
} from 'lucide-react';
import dayjs from 'dayjs';
import { jobsApi } from '../../api/jobs';
import type { Job } from '../../api/jobs';

const JOB_TYPE_OPTIONS = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Volunteer', value: 'volunteer' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: 'text-amber-700',   bg: 'bg-amber-50',   label: 'Pending' },
  approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Approved' },
  rejected: { color: 'text-rose-700',    bg: 'bg-rose-50',    label: 'Rejected' },
};

const jobTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract', volunteer: 'Volunteer',
  };
  return map[type] || type;
};

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return null;
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
};

export const JobsPage: React.FC = () => {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailJob, setDetailJob] = useState<Job | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterJobType, setFilterJobType] = useState<string | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);

  const filterTimer = useRef<any>(null);

  const fetchJobs = async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res: any = await jobsApi.listJobs({
        page,
        limit: 10,
        search,
        status: filterStatus,
        job_type: filterJobType,
        date_from: filterDateFrom,
        date_to: filterDateTo,
        ...overrides,
      });
      if (res.status) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page]);

  const debounceFilter = (overrides: Record<string, any>) => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => fetchJobs(overrides), 450);
  };

  const handleFilterChange = (key: string, value: any) => {
    const updates: Record<string, any> = {
      search, status: filterStatus, job_type: filterJobType,
      date_from: filterDateFrom, date_to: filterDateTo, [key]: value,
    };
    if (key === 'search') setSearch(value);
    if (key === 'status') setFilterStatus(value);
    if (key === 'job_type') setFilterJobType(value);
    if (key === 'date_from') setFilterDateFrom(value);
    if (key === 'date_to') setFilterDateTo(value);
    debounceFilter(updates);
  };

  const resetFilters = () => {
    setSearch(''); setFilterStatus(undefined);
    setFilterJobType(undefined); setFilterDateFrom(undefined); setFilterDateTo(undefined);
    fetchJobs({ search: '', status: undefined, job_type: undefined, date_from: undefined, date_to: undefined });
  };

  const handleVerify = async (jobId: string, status: 'approved' | 'rejected', fromModal = false) => {
    try {
      const res: any = await jobsApi.verifyJob(jobId, status);
      if (res.status) {
        message.success(res.message || `Job ${status} successfully`);
        fetchJobs();
        if (fromModal) setDetailJob(null);
      }
    } catch (err) {
      // handled by interceptor
    }
  };

  const hasFilters = search || filterStatus || filterJobType || filterDateFrom || filterDateTo;
  const pendingCount = data.filter(d => d.status === 'pending').length;

  const columns = [
    {
      title: 'Job',
      key: 'job',
      render: (_: any, record: Job) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate max-w-[200px]">{record.title}</p>
            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
              <Building2 size={12} />
              <span className="text-xs truncate max-w-[180px]">{record.company_name}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Location / Type',
      key: 'location',
      render: (_: any, record: Job) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate max-w-[140px]">{record.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="rounded-full text-[10px] px-2 py-0 border-none bg-indigo-50 text-indigo-600 font-semibold m-0">
              {jobTypeLabel(record.job_type)}
            </Tag>
            {record.is_remote && (
              <Tag className="rounded-full text-[10px] px-2 py-0 border-none bg-teal-50 text-teal-600 font-semibold m-0 flex items-center gap-1">
                <Wifi size={10} /> Remote
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Salary',
      key: 'salary',
      render: (_: any, record: Job) => {
        const salary = formatSalary(record.salary_min, record.salary_max);
        return salary ? (
          <div className="flex items-center gap-1 text-emerald-700 font-semibold text-sm">
            <DollarSign size={14} />
            <span>{salary}</span>
          </div>
        ) : <span className="text-slate-300 text-xs">Not specified</span>;
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => {
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <div className={`text-xs font-medium ${isExpired ? 'text-rose-500' : 'text-slate-600'}`}>
            <Clock size={12} className="inline mr-1" />
            {dayjs(date).format('MMM DD, YYYY')}
            {isExpired && <span className="block text-[10px] text-rose-400">Expired</span>}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const cfg = statusConfig[status] || statusConfig.pending;
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${cfg.color} ${cfg.bg}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Job) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text" size="small"
              onClick={() => setDetailJob(record)}
              className="text-primary hover:bg-primary-light text-xs font-medium px-3 h-8 rounded-lg"
            >
              Details
            </Button>
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Approve this job posting?"
                onConfirm={() => handleVerify(record._id, 'approved')}
                okText="Approve"
                cancelText="Cancel"
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
              >
                <Tooltip title="Approve">
                  <Button type="text" size="small" icon={<Check size={16} />}
                    className="text-emerald-600 hover:bg-emerald-50 h-8 w-8 flex items-center justify-center rounded-lg" />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="Reject this job posting?"
                onConfirm={() => handleVerify(record._id, 'rejected')}
                okText="Reject" cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Reject">
                  <Button type="text" size="small" icon={<X size={16} />}
                    className="text-rose-600 hover:bg-rose-50 h-8 w-8 flex items-center justify-center rounded-lg" />
                </Tooltip>
              </Popconfirm>
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
        subtitle="Review and moderate job postings from ministries and organizations."
        extra={
          pendingCount > 0 ? (
            <Badge count={pendingCount} color="#f59e0b">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl text-amber-700 text-sm font-semibold border border-amber-200">
                <Clock size={16} />
                <span>{pendingCount} Pending Review</span>
              </div>
            </Badge>
          ) : null
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search job title or company..."
              className="pl-10 h-11 rounded-xl border-slate-200"
              allowClear value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Select placeholder="All Statuses" className="h-11 w-44 custom-select" allowClear
            value={filterStatus} options={STATUS_OPTIONS}
            onChange={(val) => handleFilterChange('status', val)}
          />
          <Select placeholder="All Job Types" className="h-11 w-44 custom-select" allowClear
            value={filterJobType} options={JOB_TYPE_OPTIONS}
            onChange={(val) => handleFilterChange('job_type', val)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Date Range:</span>
          </div>
          <DatePicker placeholder="Posted from" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_from', d as string || undefined)} />
          <DatePicker placeholder="Posted to" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_to', d as string || undefined)} />
          {hasFilters && (
            <Button type="text" size="small" className="text-primary text-xs font-semibold hover:bg-primary-light ml-auto" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <AppTable
        columns={columns} dataSource={data} loading={loading} rowKey="_id"
        pagination={{ current: page, total, pageSize: 10, onChange: (p) => setPage(p), showTotal: (t) => `${t} jobs` }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={20} /></div>
            <div>
              <p className="font-bold text-slate-800 text-base leading-tight">{detailJob?.title}</p>
              <p className="text-xs text-slate-400 font-normal">{detailJob?.company_name}</p>
            </div>
          </div>
        }
        open={!!detailJob}
        onCancel={() => setDetailJob(null)}
        width={640}
        centered
        className="modern-modal"
        footer={
          detailJob?.status === 'pending' ? (
            <div className="flex gap-3 justify-end">
              <Popconfirm title="Reject this job?" onConfirm={() => handleVerify(detailJob._id, 'rejected', true)} okText="Reject" cancelText="Cancel" okButtonProps={{ danger: true }}>
                <Button danger className="rounded-xl font-semibold flex items-center gap-2"><X size={16} /> Reject</Button>
              </Popconfirm>
              <Popconfirm title="Approve this job?" onConfirm={() => handleVerify(detailJob._id, 'approved', true)} okText="Approve" cancelText="Cancel" okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}>
                <Button type="primary" className="rounded-xl font-semibold flex items-center gap-2 bg-emerald-500 border-none"><Check size={16} /> Approve</Button>
              </Popconfirm>
            </div>
          ) : (
            <Button onClick={() => setDetailJob(null)} className="rounded-xl">Close</Button>
          )
        }
      >
        {detailJob && (
          <div className="space-y-5 mt-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Header badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusConfig[detailJob.status]?.color} ${statusConfig[detailJob.status]?.bg}`}>
                {statusConfig[detailJob.status]?.label}
              </span>
              <Tag className="rounded-full text-[11px] px-3 border-none bg-indigo-50 text-indigo-600 font-semibold">{jobTypeLabel(detailJob.job_type)}</Tag>
              {detailJob.is_remote && <Tag className="rounded-full text-[11px] px-3 border-none bg-teal-50 text-teal-600 font-semibold flex items-center gap-1"><Wifi size={11} /> Remote</Tag>}
              <span className="ml-auto text-xs text-slate-400">Posted {dayjs(detailJob.created_at).format('MMM DD, YYYY')}</span>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <MapPin size={14} />, label: 'Location', value: detailJob.location },
                { icon: <Clock size={14} />, label: 'Deadline', value: dayjs(detailJob.deadline).format('MMM DD, YYYY') },
                { icon: <DollarSign size={14} />, label: 'Salary', value: formatSalary(detailJob.salary_min, detailJob.salary_max) || 'Not specified' },
                { icon: <Briefcase size={14} />, label: 'Experience', value: detailJob.experience_required },
                { icon: <Mail size={14} />, label: 'Contact Email', value: detailJob.contact_email },
                { icon: <Phone size={14} />, label: 'Contact Phone', value: detailJob.contact_phone },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">{icon}<span className="text-[10px] uppercase font-bold tracking-wider">{label}</span></div>
                  <p className="text-sm text-slate-700 font-medium truncate">{value}</p>
                </div>
              ))}
            </div>

            {detailJob.application_link && (
              <a href={detailJob.application_link} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                <Link size={14} /> View Application Link <ChevronRight size={14} />
              </a>
            )}

            <Divider className="!my-3" />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{detailJob.description}</p>
            </div>

            {detailJob.skills?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {detailJob.skills.map(skill => (
                    <Tag key={skill} className="rounded-full px-3 py-0.5 border-none bg-blue-50 text-blue-700 font-medium text-xs">{skill}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
