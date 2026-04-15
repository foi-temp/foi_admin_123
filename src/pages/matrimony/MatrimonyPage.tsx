import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import {
  Button, Space, Modal, Input, DatePicker, Select,
  message, Tag, Tooltip, Popconfirm, Badge, Avatar, Divider, Tabs
} from 'antd';
import {
  Check, X, Search, Filter, Users, Heart,
  Church, MapPin, Clock, Briefcase, Home
} from 'lucide-react';
import dayjs from 'dayjs';
import { matrimonyApi } from '../../api/matrimony';
import type { MatrimonyProfile } from '../../api/matrimony';

const DENOMINATIONS = [
  'Neutral', 'Catholic', 'Orthodox', 'Evangelical', 'Charismatic', 'Reformed',
  'Pentecostal', 'Protestant', 'Born Again'
].map(d => ({ label: d, value: d }));

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

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-2 py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-400 w-36 shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-slate-700 font-medium flex-1">{value || '—'}</span>
  </div>
);

export const MatrimonyPage: React.FC = () => {
  const [data, setData] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailProfile, setDetailProfile] = useState<MatrimonyProfile | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterDenomination, setFilterDenomination] = useState<string | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);

  const filterTimer = useRef<any>(null);

  const fetchProfiles = async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res: any = await matrimonyApi.listProfiles({
        page, limit: 10, search, status: filterStatus,
        denomination: filterDenomination, date_from: filterDateFrom, date_to: filterDateTo,
        ...overrides,
      });
      if (res.status) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch matrimony profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, [page]);

  const debounceFetch = (overrides: Record<string, any>) => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => fetchProfiles(overrides), 450);
  };

  const handleFilterChange = (key: string, value: any) => {
    const updates: Record<string, any> = {
      search, status: filterStatus, denomination: filterDenomination,
      date_from: filterDateFrom, date_to: filterDateTo, [key]: value,
    };
    if (key === 'search') setSearch(value);
    if (key === 'status') setFilterStatus(value);
    if (key === 'denomination') setFilterDenomination(value);
    if (key === 'date_from') setFilterDateFrom(value);
    if (key === 'date_to') setFilterDateTo(value);
    debounceFetch(updates);
  };

  const resetFilters = () => {
    setSearch(''); setFilterStatus(undefined);
    setFilterDenomination(undefined); setFilterDateFrom(undefined); setFilterDateTo(undefined);
    fetchProfiles({ search: '', status: undefined, denomination: undefined, date_from: undefined, date_to: undefined });
  };

  const handleVerify = async (profileId: string, status: 'approved' | 'rejected', fromModal = false) => {
    try {
      const res: any = await matrimonyApi.verifyProfile(profileId, status);
      if (res.status) {
        message.success(res.message || `Profile ${status} successfully`);
        fetchProfiles();
        if (fromModal) setDetailProfile(null);
      }
    } catch (err) {
      // handled by interceptor
    }
  };

  const hasFilters = search || filterStatus || filterDenomination || filterDateFrom || filterDateTo;
  const pendingCount = data.filter(d => d.admin_status?.status === 'pending').length;

  const columns = [
    {
      title: 'Profile',
      key: 'profile',
      render: (_: any, record: MatrimonyProfile) => {
        const img = record.profile_media?.profile_images?.[0];
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={44} src={img}
              className="shrink-0 bg-rose-100 text-rose-600 font-bold text-sm border-2 border-rose-100"
            >
              {!img && record.basic_details?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate">{record.basic_details?.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">{record.basic_details?.age} yrs</span>
                <span className="text-slate-200">•</span>
                <span className="text-xs text-slate-400">{record.basic_details?.gender}</span>
                <span className="text-slate-200">•</span>
                <span className="text-xs text-slate-400">{record.basic_details?.marital_status}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Faith',
      key: 'faith',
      render: (_: any, record: MatrimonyProfile) => (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-700">{record.faith_details?.denomination}</p>
          <p className="text-xs text-slate-400 truncate max-w-[150px]">{record.faith_details?.church_name}</p>
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: any, record: MatrimonyProfile) => (
        <div className="flex items-center gap-1 text-slate-500">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          <span className="text-xs">{record.location?.city}, {record.location?.state}</span>
        </div>
      ),
    },
    {
      title: 'Occupation',
      key: 'occupation',
      render: (_: any, record: MatrimonyProfile) => (
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">{record.education_career?.occupation}</p>
          <p className="text-xs text-slate-400 truncate max-w-[160px]">{record.education_career?.company_name}</p>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: MatrimonyProfile) => {
        const s = record.admin_status?.status || 'pending';
        const cfg = statusConfig[s];
        return (
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
            {record.admin_status?.is_verified && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <Check size={10} /> Verified
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MatrimonyProfile) => (
        <Space size="small">
          <Tooltip title="View Profile">
            <Button type="text" size="small" onClick={() => setDetailProfile(record)}
              className="text-primary hover:bg-primary-light text-xs font-medium px-3 h-8 rounded-lg">
              View
            </Button>
          </Tooltip>
          {record.admin_status?.status === 'pending' && (
            <>
              <Popconfirm title="Approve this profile?" onConfirm={() => handleVerify(record._id, 'approved')}
                okText="Approve" cancelText="Cancel"
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}>
                <Tooltip title="Approve">
                  <Button type="text" size="small" icon={<Check size={16} />}
                    className="text-emerald-600 hover:bg-emerald-50 h-8 w-8 flex items-center justify-center rounded-lg" />
                </Tooltip>
              </Popconfirm>
              <Popconfirm title="Reject this profile?" onConfirm={() => handleVerify(record._id, 'rejected')}
                okText="Reject" cancelText="Cancel" okButtonProps={{ danger: true }}>
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

  const p = detailProfile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrimony Management"
        subtitle="Review and verify matrimony profiles for the faithful community."
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
            <Input placeholder="Search by name, church or city..." className="pl-10 h-11 rounded-xl border-slate-200"
              allowClear value={search} onChange={(e) => handleFilterChange('search', e.target.value)} />
          </div>
          <Select placeholder="All Statuses" className="h-11 w-44 custom-select" allowClear
            value={filterStatus} options={STATUS_OPTIONS} onChange={(val) => handleFilterChange('status', val)} />
          <Select placeholder="All Denominations" className="h-11 w-48 custom-select" allowClear
            value={filterDenomination} options={DENOMINATIONS} onChange={(val) => handleFilterChange('denomination', val)} />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Date Range:</span>
          </div>
          <DatePicker placeholder="From date" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_from', d as string || undefined)} />
          <DatePicker placeholder="To date" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_to', d as string || undefined)} />
          {hasFilters && (
            <Button type="text" size="small" className="text-primary text-xs font-semibold hover:bg-primary-light ml-auto" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <AppTable columns={columns} dataSource={data} loading={loading} rowKey="_id"
        pagination={{ current: page, total, pageSize: 10, onChange: (pg) => setPage(pg), showTotal: (t) => `${t} profiles` }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          p && (
            <div className="flex items-center gap-3 pb-2">
              <Avatar size={48} src={p.profile_media?.profile_images?.[0]}
                className="bg-rose-100 text-rose-500 font-bold border-2 border-rose-100 shrink-0">
                {p.basic_details?.full_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div>
                <p className="font-bold text-slate-800 text-base leading-tight">{p.basic_details?.full_name}</p>
                <p className="text-xs text-slate-400 font-normal">{p.basic_details?.age} yrs • {p.location?.city}, {p.location?.state}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-[11px] font-bold ${statusConfig[p.admin_status?.status]?.color} ${statusConfig[p.admin_status?.status]?.bg}`}>
                {statusConfig[p.admin_status?.status]?.label}
              </span>
            </div>
          )
        }
        open={!!detailProfile}
        onCancel={() => setDetailProfile(null)}
        width={700}
        centered
        className="modern-modal"
        footer={
          p?.admin_status?.status === 'pending' ? (
            <div className="flex gap-3 justify-end">
              <Popconfirm title="Reject this profile?" onConfirm={() => handleVerify(p._id, 'rejected', true)} okText="Reject" cancelText="Cancel" okButtonProps={{ danger: true }}>
                <Button danger className="rounded-xl font-semibold flex items-center gap-2"><X size={16} /> Reject</Button>
              </Popconfirm>
              <Popconfirm title="Approve this profile?" onConfirm={() => handleVerify(p._id, 'approved', true)} okText="Approve" cancelText="Cancel"
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}>
                <Button type="primary" className="rounded-xl font-semibold flex items-center gap-2 bg-emerald-500 border-none">
                  <Check size={16} /> Approve
                </Button>
              </Popconfirm>
            </div>
          ) : (
            <Button onClick={() => setDetailProfile(null)} className="rounded-xl">Close</Button>
          )
        }
      >
        {p && (
          <div className="max-h-[72vh] overflow-y-auto pr-1">
            <Tabs
              size="small"
              className="modern-tabs"
              items={[
                {
                  key: 'basic',
                  label: <span className="flex items-center gap-1.5"><Users size={14} /> Basic</span>,
                  children: (
                    <div className="space-y-1 pt-2">
                      <InfoRow label="Full Name" value={p.basic_details.full_name} />
                      <InfoRow label="Gender" value={p.basic_details.gender} />
                      <InfoRow label="Age" value={`${p.basic_details.age} years`} />
                      <InfoRow label="Date of Birth" value={dayjs(p.basic_details.date_of_birth).format('MMMM DD, YYYY')} />
                      <InfoRow label="Marital Status" value={p.basic_details.marital_status} />
                      <InfoRow label="Profile Created By" value={p.basic_details.profile_created_by} />
                      <Divider className="!my-3" /><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{p.about_me}</p>
                    </div>
                  ),
                },
                {
                  key: 'faith',
                  label: <span className="flex items-center gap-1.5"><Church size={14} /> Faith</span>,
                  children: (
                    <div className="pt-2">
                      <InfoRow label="Religion" value={p.faith_details.religion} />
                      <InfoRow label="Denomination" value={p.faith_details.denomination} />
                      <InfoRow label="Church" value={p.faith_details.church_name} />
                      <InfoRow label="Baptized" value={p.faith_details.baptized ? '✅ Yes' : '❌ No'} />
                      <InfoRow label="Born Again" value={p.faith_details.born_again ? '✅ Yes' : '❌ No'} />
                      <InfoRow label="Faith Level" value={p.faith_details.faith_level} />
                      <InfoRow label="Ministries" value={
                        <div className="flex flex-wrap gap-1">{p.faith_details.ministry_involvement?.map(m => <Tag key={m} className="rounded-full text-[10px] px-2 border-none bg-violet-50 text-violet-600 font-medium m-0">{m}</Tag>)}</div>
                      } />
                      <Divider className="!my-3" /><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Faith Features</p>
                      <InfoRow label="Daily Prayer" value={p.faith_features.daily_prayer_habit ? '✅ Yes' : '❌ No'} />
                      <InfoRow label="Bible Reading" value={p.faith_features.bible_reading_frequency} />
                      <InfoRow label="Favourite Verse" value={<em className="text-slate-600">"{p.faith_features.favorite_verse}"</em>} />
                      <InfoRow label="Spiritual Goals" value={
                        <ul className="list-disc list-inside space-y-0.5">{p.faith_features.spiritual_goals?.map(g => <li key={g} className="text-xs text-slate-600">{g}</li>)}</ul>
                      } />
                    </div>
                  ),
                },
                {
                  key: 'career',
                  label: <span className="flex items-center gap-1.5"><Briefcase size={14} /> Career</span>,
                  children: (
                    <div className="pt-2">
                      <InfoRow label="Education" value={p.education_career.education} />
                      <InfoRow label="Occupation" value={p.education_career.occupation} />
                      <InfoRow label="Company" value={p.education_career.company_name} />
                      <InfoRow label="Annual Income" value={p.education_career.annual_income} />
                      <InfoRow label="Work Location" value={p.education_career.work_location} />
                      <Divider className="!my-3" /><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Details</p>
                      <InfoRow label="Height" value={`${p.personal_details.height_cm} cm`} />
                      <InfoRow label="Weight" value={`${p.personal_details.weight} kg`} />
                      <InfoRow label="Body Type" value={p.personal_details.body_type} />
                      <InfoRow label="Complexion" value={p.personal_details.complexion} />
                      <InfoRow label="Physical Status" value={p.personal_details.physical_status} />
                    </div>
                  ),
                },
                {
                  key: 'family',
                  label: <span className="flex items-center gap-1.5"><Home size={14} /> Family</span>,
                  children: (
                    <div className="pt-2">
                      <InfoRow label="Father's Name" value={p.family_details.father_name} />
                      <InfoRow label="Father's Occupation" value={p.family_details.father_occupation} />
                      <InfoRow label="Mother's Name" value={p.family_details.mother_name} />
                      <InfoRow label="Mother's Occupation" value={p.family_details.mother_occupation} />
                      <InfoRow label="Siblings" value={`${p.family_details.siblings_count} sibling(s)`} />
                      <InfoRow label="Family Status" value={p.family_details.family_status} />
                      <InfoRow label="Family Type" value={p.family_details.family_type} />
                      <Divider className="!my-3" /><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lifestyle</p>
                      <InfoRow label="Diet" value={p.lifestyle.diet} />
                      <InfoRow label="Smoking" value={p.lifestyle.smoking ? '❌ Yes' : '✅ No'} />
                      <InfoRow label="Drinking" value={p.lifestyle.drinking ? '❌ Yes' : '✅ No'} />
                      <InfoRow label="Hobbies" value={
                        <div className="flex flex-wrap gap-1">{p.lifestyle.hobbies?.map(h => <Tag key={h} className="rounded-full text-[10px] px-2 border-none bg-slate-100 text-slate-600 font-medium m-0">{h}</Tag>)}</div>
                      } />
                    </div>
                  ),
                },
                {
                  key: 'partner',
                  label: <span className="flex items-center gap-1.5"><Heart size={14} /> Partner</span>,
                  children: (
                    <div className="pt-2">
                      <InfoRow label="Age Range" value={`${p.partner_preferences.preferred_age_min} – ${p.partner_preferences.preferred_age_max} years`} />
                      <InfoRow label="Height Range" value={`${p.partner_preferences.preferred_height_min} – ${p.partner_preferences.preferred_height_max} cm`} />
                      <InfoRow label="Marital Status" value={p.partner_preferences.preferred_marital_status?.join(', ')} />
                      <InfoRow label="Education" value={p.partner_preferences.expected_education} />
                      <InfoRow label="Faith Level" value={p.partner_preferences.expected_faith_level} />
                      <InfoRow label="Denominations" value={
                        <div className="flex flex-wrap gap-1">{p.partner_preferences.preferred_denomination?.map(d => <Tag key={d} className="rounded-full text-[10px] px-2 border-none bg-rose-50 text-rose-600 font-medium m-0">{d}</Tag>)}</div>
                      } />
                      <InfoRow label="Locations" value={
                        <div className="flex flex-wrap gap-1">{p.partner_preferences.preferred_location?.map(l => <Tag key={l} className="rounded-full text-[10px] px-2 border-none bg-blue-50 text-blue-600 font-medium m-0">{l}</Tag>)}</div>
                      } />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
