import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AppTable } from '../../components/common/AppTable';
import {
  Avatar, Input, DatePicker, Select, Modal, Button, Divider
} from 'antd';
import {
  Search, Filter, MessageCircle, Hand, Heart, Phone, Church, Calendar
} from 'lucide-react';
import dayjs from 'dayjs';
import { prayersApi } from '../../api/prayers';
import type { PrayerRequest } from '../../api/prayers';

const PRAYER_CATEGORIES = [
  'health', 'family', 'finance', 'guidance', 'relationships',
  'spiritual', 'work', 'protection', 'gratitude', 'other'
].map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }));

const categoryColor: Record<string, string> = {
  health: 'bg-rose-50 text-rose-600',
  family: 'bg-violet-50 text-violet-600',
  finance: 'bg-emerald-50 text-emerald-700',
  guidance: 'bg-blue-50 text-blue-600',
  relationships: 'bg-pink-50 text-pink-600',
  spiritual: 'bg-amber-50 text-amber-700',
  work: 'bg-indigo-50 text-indigo-600',
  protection: 'bg-slate-100 text-slate-600',
  gratitude: 'bg-teal-50 text-teal-600',
  other: 'bg-slate-100 text-slate-500',
};

export const PrayersPage: React.FC = () => {
  const [data, setData] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailPrayer, setDetailPrayer] = useState<PrayerRequest | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);

  const filterTimer = useRef<any>(null);

  const fetchPrayers = async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res: any = await prayersApi.listPrayers({
        page, limit: 10, search,
        category: filterCategory,
        date_from: filterDateFrom,
        date_to: filterDateTo,
        ...overrides,
      });
      if (res.status) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch prayers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrayers(); }, [page]);

  const debounceFetch = (overrides: Record<string, any>) => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => fetchPrayers(overrides), 450);
  };

  const handleFilterChange = (key: string, value: any) => {
    const updates: Record<string, any> = {
      search, category: filterCategory,
      date_from: filterDateFrom, date_to: filterDateTo, [key]: value,
    };
    if (key === 'search') setSearch(value);
    if (key === 'category') setFilterCategory(value);
    if (key === 'date_from') setFilterDateFrom(value);
    if (key === 'date_to') setFilterDateTo(value);
    debounceFetch(updates);
  };

  const resetFilters = () => {
    setSearch(''); setFilterCategory(undefined);
    setFilterDateFrom(undefined); setFilterDateTo(undefined);
    fetchPrayers({ search: '', category: undefined, date_from: undefined, date_to: undefined });
  };

  const hasFilters = search || filterCategory || filterDateFrom || filterDateTo;

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: PrayerRequest) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="shrink-0 bg-primary text-white font-bold text-sm">
            {record.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{record.user?.name}</p>
            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
              <Phone size={11} />
              <span className="text-xs">{record.user?.phone}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${categoryColor[cat] || 'bg-slate-100 text-slate-500'}`}>
          {cat}
        </span>
      ),
    },
    {
      title: 'Prayer Request',
      dataIndex: 'content',
      key: 'content',
      width: '38%',
      render: (text: string, record: PrayerRequest) => (
        <div>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{text}</p>
          <button
            onClick={() => setDetailPrayer(record)}
            className="text-[11px] text-primary font-medium mt-1 hover:underline"
          >
            Read more
          </button>
        </div>
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (_: any, record: PrayerRequest) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Hand size={14} className="text-primary" />
            <span className="text-sm font-semibold text-slate-700">{record.prayed_count}</span>
            <span className="text-xs text-slate-400">prayed</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Heart size={14} className="text-rose-400" />
            <span className="text-sm font-semibold text-slate-700">{record.encourage_count}</span>
            <span className="text-xs text-slate-400">encouraged</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Posted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div className="text-xs text-slate-500">
          <p>{dayjs(date).format('MMM DD, YYYY')}</p>
          <p className="text-slate-400">{dayjs(date).format('hh:mm A')}</p>
        </div>
      ),
    },
  ];

  const p = detailPrayer;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prayer Requests"
        subtitle="Monitor and oversee prayer requests submitted by the community."
      />

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search prayer content..."
              className="pl-10 h-11 rounded-xl border-slate-200"
              allowClear value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <Select
            placeholder="All Categories"
            className="h-11 w-48 custom-select"
            allowClear
            value={filterCategory}
            options={PRAYER_CATEGORIES}
            onChange={(val) => handleFilterChange('category', val)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Date Range:</span>
          </div>
          <DatePicker
            placeholder="From date" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_from', d as string || undefined)}
          />
          <DatePicker
            placeholder="To date" className="h-9 rounded-xl"
            onChange={(_, d) => handleFilterChange('date_to', d as string || undefined)}
          />
          {hasFilters && (
            <Button
              type="text" size="small"
              className="text-primary text-xs font-semibold hover:bg-primary-light ml-auto"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <AppTable
        columns={columns} dataSource={data} loading={loading} rowKey="id"
        pagination={{
          current: page, total, pageSize: 10,
          onChange: (pg) => setPage(pg),
          showTotal: (t) => `${t} prayer requests`,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          p && (
            <div className="flex items-center gap-3 pb-2">
              <div className="p-2 bg-primary-light rounded-lg text-primary">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">Prayer Request</p>
                <p className="text-xs text-slate-400 font-normal capitalize">{p.category} • {dayjs(p.created_at).format('MMM DD, YYYY [at] hh:mm A')}</p>
              </div>
            </div>
          )
        }
        open={!!detailPrayer}
        onCancel={() => setDetailPrayer(null)}
        footer={<Button onClick={() => setDetailPrayer(null)} className="rounded-xl">Close</Button>}
        width={520}
        centered
        className="modern-modal"
      >
        {p && (
          <div className="space-y-5 mt-3">
            {/* User info */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <Avatar size={44} className="bg-primary text-white font-bold shrink-0">
                {p.user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{p.user?.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={11} />{p.user?.phone}</span>
                  <span className="flex items-center gap-1"><Church size={11} />{p.user?.denomination}</span>
                </div>
              </div>
            </div>

            {/* Category & date */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${categoryColor[p.category] || 'bg-slate-100 text-slate-500'}`}>
                {p.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                {dayjs(p.created_at).format('MMMM DD, YYYY')}
              </span>
            </div>

            {/* Prayer content */}
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Prayer Request</p>
              <p className="text-sm text-slate-700 leading-relaxed">{p.content}</p>
            </div>

            <Divider className="!my-3" />

            {/* Engagement stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-light rounded-xl p-4 text-center border border-primary/10">
                <div className="flex justify-center mb-1 text-primary"><Hand size={22} /></div>
                <p className="text-2xl font-bold text-primary">{p.prayed_count}</p>
                <p className="text-xs text-slate-500 font-medium">People Prayed</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                <div className="flex justify-center mb-1 text-rose-400"><Heart size={22} /></div>
                <p className="text-2xl font-bold text-rose-500">{p.encourage_count}</p>
                <p className="text-xs text-slate-500 font-medium">Encouragements</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
