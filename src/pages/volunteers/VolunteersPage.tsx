import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import {
  Button, Space, Modal, DatePicker, Select,
  message, Tag, Tooltip, Badge, Avatar, Popconfirm
} from 'antd';
import {
  Users, Check, X, Calendar, Filter,
  Phone, Briefcase, Clock
} from 'lucide-react';
import dayjs from 'dayjs';
import { volunteersApi } from '../../api/volunteers';
import type { VolunteerApplication } from '../../api/volunteers';

const DENOMINATIONS = [
  'Neutral', 'Catholic', 'Orthodox', 'Evangelical', 'Charismatic', 'Reformed'
].map(d => ({ label: d, value: d }));

const CATEGORIES = [
  'Prayer', 'Service', 'Youth', 'Seminar', 'Social', 'Other'
].map(c => ({ label: c, value: c }));

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: 'text-amber-700',  bg: 'bg-amber-50',   label: 'Pending' },
  approved:  { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Approved' },
  rejected:  { color: 'text-rose-700',   bg: 'bg-rose-50',    label: 'Rejected' },
  cancelled: { color: 'text-slate-600',  bg: 'bg-slate-100',  label: 'Cancelled' },
};

export const VolunteersPage: React.FC = () => {
  const [data, setData] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailModal, setDetailModal] = useState<VolunteerApplication | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterDenomination, setFilterDenomination] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);

  const filterTimer = useRef<any>(null);

  const fetchApplications = async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res: any = await volunteersApi.listApplications({
        page,
        limit: 10,
        category: filterCategory,
        denomination: filterDenomination,
        status: filterStatus,
        date_from: filterDateFrom,
        date_to: filterDateTo,
        ...overrides,
      });
      if (res.status) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch volunteer applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page]);

  const scheduleRefetch = (overrides: Record<string, any>) => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => fetchApplications(overrides), 400);
  };

  const handleFilterChange = (key: string, value: any) => {
    const overrides: Record<string, any> = {
      category: filterCategory,
      denomination: filterDenomination,
      status: filterStatus,
      date_from: filterDateFrom,
      date_to: filterDateTo,
      [key]: value,
    };

    if (key === 'category') setFilterCategory(value);
    if (key === 'denomination') setFilterDenomination(value);
    if (key === 'status') setFilterStatus(value);
    if (key === 'date_from') setFilterDateFrom(value);
    if (key === 'date_to') setFilterDateTo(value);

    scheduleRefetch(overrides);
  };

  const resetFilters = () => {
    setFilterCategory(undefined);
    setFilterDenomination(undefined);
    setFilterStatus(undefined);
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    fetchApplications({ category: undefined, denomination: undefined, status: undefined, date_from: undefined, date_to: undefined });
  };

  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const res: any = await volunteersApi.updateStatus(applicationId, status);
      if (res.status) {
        message.success(res.message || `Application ${status}`);
        fetchApplications();
      }
    } catch (err) {
      // handled by interceptor
    }
  };

  const hasFilters = filterCategory || filterDenomination || filterStatus || filterDateFrom || filterDateTo;
  const pendingCount = data.filter(d => d.status === 'pending').length;

  const columns = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_: any, record: VolunteerApplication) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="shrink-0 bg-primary text-white font-bold text-sm"
          >
            {record.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{record.full_name || '—'}</p>
            <div className="flex items-center gap-1 text-slate-400">
              <Phone size={12} />
              <span className="text-xs">{record.phone || '—'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Event',
      key: 'event',
      render: (_: any, record: VolunteerApplication) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-700 truncate max-w-[180px]">{record.event_title || '—'}</p>
          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
            <Calendar size={12} />
            <span className="text-xs">{dayjs(record.event_date_time).format('MMM DD, YYYY')}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs">{record.event_category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag className="rounded-full px-3 py-0.5 border-none bg-blue-50 text-blue-700 font-medium text-[11px]">
          {role || '—'}
        </Tag>
      ),
    },
    {
      title: 'Denomination',
      dataIndex: 'denomination',
      key: 'denomination',
      render: (den: string) => (
        <span className="text-xs text-slate-500">{den || '—'}</span>
      ),
    },
    {
      title: 'Applied',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (date: string) => (
        <div className="text-xs text-slate-500">
          <p>{dayjs(date).format('MMM DD, YYYY')}</p>
          <p className="text-slate-400">{dayjs(date).format('hh:mm A')}</p>
        </div>
      ),
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
      render: (_: any, record: VolunteerApplication) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              onClick={() => setDetailModal(record)}
              className="text-primary hover:bg-primary-light text-xs font-medium px-3 h-8 rounded-lg"
            >
              Details
            </Button>
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Approve this application?"
                onConfirm={() => handleStatusUpdate(record.application_id, 'approved')}
                okText="Approve"
                cancelText="Cancel"
                okButtonProps={{ style: { background: '#10b981' } }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<Check size={16} />}
                  className="text-emerald-600 hover:bg-emerald-50 h-8 w-8 flex items-center justify-center rounded-lg"
                />
              </Popconfirm>
              <Popconfirm
                title="Reject this application?"
                onConfirm={() => handleStatusUpdate(record.application_id, 'rejected')}
                okText="Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<X size={16} />}
                  className="text-rose-600 hover:bg-rose-50 h-8 w-8 flex items-center justify-center rounded-lg"
                />
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
        title="Volunteer Applications"
        subtitle="Review and manage volunteer applications for faith-based events."
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
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Filter size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Filter Applications</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            placeholder="All Categories"
            className="h-10 custom-select"
            allowClear
            value={filterCategory}
            options={CATEGORIES}
            onChange={(val) => handleFilterChange('category', val)}
          />
          <Select
            placeholder="All Denominations"
            className="h-10 custom-select"
            allowClear
            value={filterDenomination}
            options={DENOMINATIONS}
            onChange={(val) => handleFilterChange('denomination', val)}
          />
          <Select
            placeholder="All Statuses"
            className="h-10 custom-select"
            allowClear
            value={filterStatus}
            options={STATUS_OPTIONS}
            onChange={(val) => handleFilterChange('status', val)}
          />
          <div className="flex gap-2">
            <DatePicker
              placeholder="From date"
              className="h-10 rounded-xl flex-1"
              onChange={(_, dateStr) => handleFilterChange('date_from', dateStr as string || undefined)}
            />
            <DatePicker
              placeholder="To date"
              className="h-10 rounded-xl flex-1"
              onChange={(_, dateStr) => handleFilterChange('date_to', dateStr as string || undefined)}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <Button
              type="text"
              size="small"
              className="text-primary text-xs font-semibold hover:bg-primary-light"
              onClick={resetFilters}
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <AppTable
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="application_id"
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `${total} applications`,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-2">
            <div className="p-2 bg-primary-light rounded-lg text-primary">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{detailModal?.full_name}</p>
              <p className="text-xs text-slate-400 font-normal">Application Details</p>
            </div>
          </div>
        }
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={
          detailModal?.status === 'pending' ? (
            <div className="flex gap-3 justify-end">
              <Popconfirm
                title="Reject this application?"
                onConfirm={() => { handleStatusUpdate(detailModal.application_id, 'rejected'); setDetailModal(null); }}
                okText="Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button danger className="rounded-xl font-semibold flex items-center gap-2">
                  <X size={16} /> Reject
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Approve this application?"
                onConfirm={() => { handleStatusUpdate(detailModal.application_id, 'approved'); setDetailModal(null); }}
                okText="Approve"
                cancelText="Cancel"
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
              >
                <Button type="primary" className="rounded-xl font-semibold flex items-center gap-2 bg-emerald-500 border-none">
                  <Check size={16} /> Approve
                </Button>
              </Popconfirm>
            </div>
          ) : (
            <Button onClick={() => setDetailModal(null)} className="rounded-xl">Close</Button>
          )
        }
        width={580}
        centered
        className="modern-modal"
      >
        {detailModal && (
          <div className="space-y-5 mt-4">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig[detailModal.status]?.color} ${statusConfig[detailModal.status]?.bg}`}>
                {statusConfig[detailModal.status]?.label}
              </span>
              <span className="text-xs text-slate-400">Applied {dayjs(detailModal.applied_at).format('MMM DD, YYYY [at] hh:mm A')}</span>
            </div>

            {/* Event Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Event Information</p>
              <p className="font-bold text-slate-800 text-base">{detailModal.event_title}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={14} /> {dayjs(detailModal.event_date_time).format('MMM DD, YYYY hh:mm A')}</span>
                <span className="text-slate-300">•</span>
                <span>{detailModal.event_category}</span>
              </div>
            </div>

            {/* Applicant Info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Phone', value: detailModal.phone, icon: <Phone size={14} /> },
                { label: 'Role Applied', value: detailModal.role, icon: <Briefcase size={14} /> },
                { label: 'Denomination', value: detailModal.denomination, icon: <Users size={14} /> },
                { label: 'Availability', value: detailModal.availability, icon: <Clock size={14} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    {icon}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
                </div>
              ))}
            </div>

            {detailModal.experience && (
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Experience / Notes</p>
                <p className="text-sm text-slate-600 leading-relaxed">{detailModal.experience}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
