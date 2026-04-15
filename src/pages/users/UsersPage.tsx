import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import {
  Button, Space, Input, DatePicker, Select,
  message, Tag, Tooltip, Popconfirm, Badge, Avatar, Modal
} from 'antd';
import {
  Search, Filter, Phone, Users, ShieldOff, ShieldCheck,
  Calendar, BookOpen, Heart, CheckCircle, XCircle, MapPin, Clock
} from 'lucide-react';
import dayjs from 'dayjs';
import { usersApi } from '../../api/users';
import type { AppUser } from '../../api/users';

const DENOMINATIONS = [
  'Neutral', 'Catholic', 'Orthodox', 'Evangelical', 'Charismatic', 'Reformed',
  'Pentecostal', 'Protestant', 'Born Again'
].map(d => ({ label: d, value: d }));

const ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Revoked', value: 'false' },
];

const PROFILE_OPTIONS = [
  { label: 'Setup Complete', value: 'true' },
  { label: 'Incomplete', value: 'false' },
];

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex gap-3 py-2.5 border-b border-slate-50 last:border-0 items-start">
    <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <div className="text-sm text-slate-700 font-medium">{value || '—'}</div>
    </div>
  </div>
);

export const UsersPage: React.FC = () => {
  const [data, setData] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailUser, setDetailUser] = useState<AppUser | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string | undefined>(undefined);
  const [filterDenomination, setFilterDenomination] = useState<string | undefined>(undefined);
  const [filterProfileComplete, setFilterProfileComplete] = useState<string | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);

  const filterTimer = useRef<any>(null);

  const fetchUsers = async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const opts: Record<string, any> = {
        page, limit: 10, search,
        denomination: filterDenomination,
        date_from: filterDateFrom, date_to: filterDateTo,
        ...overrides,
      };
      if (filterActive !== undefined) opts.is_active = filterActive === 'true';
      if (filterProfileComplete !== undefined) opts.is_profile_setup_complete = filterProfileComplete === 'true';

      const res: any = await usersApi.listUsers(opts);
      if (res.status) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const debounceFetch = (overrides: Record<string, any>) => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => fetchUsers(overrides), 450);
  };

  const handleFilterChange = (key: string, value: any) => {
    const updates: Record<string, any> = {
      search, denomination: filterDenomination,
      date_from: filterDateFrom, date_to: filterDateTo, [key]: value,
    };
    if (key === 'search') setSearch(value);
    if (key === 'is_active') { setFilterActive(value); if (value !== undefined) updates.is_active = value === 'true'; }
    if (key === 'denomination') setFilterDenomination(value);
    if (key === 'is_profile_setup_complete') { setFilterProfileComplete(value); if (value !== undefined) updates.is_profile_setup_complete = value === 'true'; }
    if (key === 'date_from') setFilterDateFrom(value);
    if (key === 'date_to') setFilterDateTo(value);
    debounceFetch(updates);
  };

  const resetFilters = () => {
    setSearch(''); setFilterActive(undefined); setFilterDenomination(undefined);
    setFilterProfileComplete(undefined); setFilterDateFrom(undefined); setFilterDateTo(undefined);
    fetchUsers({ search: '', is_active: undefined, denomination: undefined, is_profile_setup_complete: undefined, date_from: undefined, date_to: undefined });
  };

  const handleRevoke = async (userId: string, isActive: boolean, fromModal = false) => {
    try {
      await usersApi.revokeUser(userId, isActive);
      message.success(isActive ? 'User reinstated successfully' : 'User access revoked successfully');
      // Update local state immediately
      setData(prev => prev.map(u => u._id === userId ? { ...u, is_active: isActive } : u));
      if (fromModal && detailUser?._id === userId) {
        setDetailUser(prev => prev ? { ...prev, is_active: isActive } : null);
      }
    } catch (err) {
      // handled by interceptor
    }
  };

  const hasFilters = search || filterActive !== undefined || filterDenomination || filterProfileComplete !== undefined || filterDateFrom || filterDateTo;
  const revokedCount = data.filter(u => !u.is_active).length;

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: AppUser) => (
        <div className="flex items-center gap-3">
          <Avatar size={42} className={`shrink-0 font-bold text-sm border-2 ${record.is_active ? 'bg-primary text-white border-primary/20' : 'bg-slate-200 text-slate-500 border-slate-200'}`}>
            {record.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800 truncate">{record.full_name || '—'}</p>
              {!record.is_active && (
                <Tag className="rounded-full text-[9px] px-1.5 py-0 border-none bg-rose-50 text-rose-500 font-bold uppercase m-0">Revoked</Tag>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
              <Phone size={12} />
              <span className="text-xs">{record.phone_number}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Denomination',
      key: 'denomination',
      render: (_: any, record: AppUser) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-700">{record.denomination || '—'}</span>
          <div className="text-xs text-slate-400">{record.language} • {record.bible_version}</div>
        </div>
      ),
    },
    {
      title: 'Profile Status',
      key: 'profile_status',
      render: (_: any, record: AppUser) => (
        <div className="space-y-1">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${record.is_profile_setup_complete ? 'text-emerald-600' : 'text-amber-600'}`}>
            {record.is_profile_setup_complete
              ? <><CheckCircle size={13} /> Complete</>
              : <><XCircle size={13} /> Incomplete</>
            }
          </div>
          {record.is_matrimony_profile_created && (
            <div className="flex items-center gap-1 text-[10px] text-rose-500 font-medium">
              <Heart size={10} /> Matrimony Profile
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div className="text-xs text-slate-500">
          <p>{dayjs(date).format('MMM DD, YYYY')}</p>
          <p className="text-slate-400">{dayjs(date).format('hh:mm A')}</p>
        </div>
      ),
    },
    {
      title: 'Access',
      key: 'access',
      render: (_: any, record: AppUser) => (
        <Tooltip title={record.is_active ? 'Active — can use the app' : 'Revoked — no API access'}>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${record.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {record.is_active ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
            {record.is_active ? 'Active' : 'Revoked'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AppUser) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" size="small" onClick={() => setDetailUser(record)}
              className="text-primary hover:bg-primary-light text-xs font-medium px-3 h-8 rounded-lg">
              Details
            </Button>
          </Tooltip>
          {record.is_active ? (
            <Popconfirm
              title="Revoke access for this user?"
              description="User will lose all API access immediately."
              onConfirm={() => handleRevoke(record._id, false)}
              okText="Revoke" cancelText="Cancel" okButtonProps={{ danger: true }}
            >
              <Tooltip title="Revoke Access">
                <Button type="text" size="small" icon={<ShieldOff size={16} />}
                  className="text-rose-500 hover:bg-rose-50 h-8 w-8 flex items-center justify-center rounded-lg" />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Reinstate this user?"
              description="User will regain access to the app."
              onConfirm={() => handleRevoke(record._id, true)}
              okText="Reinstate" cancelText="Cancel"
              okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
            >
              <Tooltip title="Reinstate">
                <Button type="text" size="small" icon={<ShieldCheck size={16} />}
                  className="text-emerald-600 hover:bg-emerald-50 h-8 w-8 flex items-center justify-center rounded-lg" />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const u = detailUser;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage all registered users and control account access."
        extra={
          revokedCount > 0 ? (
            <Badge count={revokedCount} color="#ef4444">
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl text-rose-700 text-sm font-semibold border border-rose-200">
                <ShieldOff size={16} />
                <span>{revokedCount} Revoked</span>
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
            <Input placeholder="Search by name or phone number..." className="pl-10 h-11 rounded-xl border-slate-200"
              allowClear value={search} onChange={(e) => handleFilterChange('search', e.target.value)} />
          </div>
          <Select placeholder="All Statuses" className="h-11 w-40 custom-select" allowClear
            value={filterActive} options={ACTIVE_OPTIONS} onChange={(val) => handleFilterChange('is_active', val)} />
          <Select placeholder="All Denominations" className="h-11 w-48 custom-select" allowClear
            value={filterDenomination} options={DENOMINATIONS} onChange={(val) => handleFilterChange('denomination', val)} />
          <Select placeholder="Profile Status" className="h-11 w-44 custom-select" allowClear
            value={filterProfileComplete} options={PROFILE_OPTIONS} onChange={(val) => handleFilterChange('is_profile_setup_complete', val)} />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Joined Date:</span>
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
        pagination={{ current: page, total, pageSize: 10, onChange: (pg) => setPage(pg), showTotal: (t) => `${t} users` }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          u && (
            <div className="flex items-center gap-3 pb-2">
              <Avatar size={48} className={`font-bold shrink-0 border-2 ${u.is_active ? 'bg-primary text-white border-primary/20' : 'bg-slate-200 text-slate-500 border-slate-200'}`}>
                {u.full_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-base truncate">{u.full_name}</p>
                  {!u.is_active && <Tag className="rounded-full text-[9px] px-1.5 border-none bg-rose-50 text-rose-500 font-bold uppercase shrink-0">Revoked</Tag>}
                </div>
                <p className="text-xs text-slate-400">{u.phone_number}</p>
              </div>
              <Tooltip title={u.is_active ? 'Revoke Access' : 'Reinstate User'}>
                <Popconfirm
                  title={u.is_active ? 'Revoke access for this user?' : 'Reinstate this user?'}
                  onConfirm={() => handleRevoke(u._id, !u.is_active, true)}
                  okText={u.is_active ? 'Revoke' : 'Reinstate'} cancelText="Cancel"
                  okButtonProps={u.is_active ? { danger: true } : { style: { background: '#10b981', borderColor: '#10b981' } }}
                >
                  <Button
                    size="small"
                    className={`rounded-xl flex items-center gap-1.5 font-semibold text-xs px-3 h-8 border ${u.is_active ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                    icon={u.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  >
                    {u.is_active ? 'Revoke' : 'Reinstate'}
                  </Button>
                </Popconfirm>
              </Tooltip>
            </div>
          )
        }
        open={!!detailUser}
        onCancel={() => setDetailUser(null)}
        footer={<Button onClick={() => setDetailUser(null)} className="rounded-xl">Close</Button>}
        width={600}
        centered
        className="modern-modal"
      >
        {u && (
          <div className="space-y-5 mt-2 max-h-[70vh] overflow-y-auto pr-1">

            {/* Basic Info */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Account Information</p>
              <InfoItem icon={<Phone size={15} />} label="Phone Number" value={u.phone_number} />
              <InfoItem icon={<Users size={15} />} label="Gender" value={u.gender} />
              <InfoItem icon={<Calendar size={15} />} label="Date of Birth" value={u.dob ? dayjs(u.dob).format('MMMM DD, YYYY') : null} />
              <InfoItem icon={<MapPin size={15} />} label="Location" value={u.location} />
              <InfoItem icon={<Clock size={15} />} label="Joined" value={dayjs(u.created_at).format('MMMM DD, YYYY [at] hh:mm A')} />
            </div>

            {/* Faith Info */}
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Faith Profile</p>
              <InfoItem icon={<BookOpen size={15} />} label="Denomination" value={u.denomination} />
              <InfoItem icon={<BookOpen size={15} />} label="Bible Version" value={u.bible_version} />
              <InfoItem icon={<BookOpen size={15} />} label="Language" value={u.language} />
              <InfoItem icon={<Heart size={15} />} label="Happiness Level" value={u.happiness_level} />
              {u.goals?.length > 0 && (
                <InfoItem icon={<CheckCircle size={15} />} label="Spiritual Goals" value={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.goals.map(g => <Tag key={g} className="rounded-full text-[10px] px-2 border-none bg-violet-50 text-violet-600 font-medium m-0">{g}</Tag>)}
                  </div>
                } />
              )}
            </div>

            {/* Account Flags */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Phone Verified', value: u.is_phone_verified },
                { label: 'Profile Complete', value: u.is_profile_setup_complete },
                { label: 'Matrimony Profile', value: u.is_matrimony_profile_created },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded-xl p-3 border text-center ${value ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`flex justify-center mb-1 ${value ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {value ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold text-center">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
