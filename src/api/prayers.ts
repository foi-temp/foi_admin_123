import apiClient from './apiClient';

export interface PrayerUser {
  id: string;
  name: string;
  phone: string;
  denomination: string;
}

export interface PrayerRequest {
  id: string;
  content: string;
  category: string;
  created_at: string;
  prayed_count: number;
  encourage_count: number;
  user: PrayerUser;
}

export interface PrayerListResponse {
  status: boolean;
  total: number;
  page: number;
  limit: number;
  data: PrayerRequest[];
}

export interface PrayerFilters {
  page?: number;
  limit?: number;
  user_id?: string;
  category?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export const prayersApi = {
  listPrayers: (filters: PrayerFilters = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page || 1));
    params.set('limit', String(filters.limit || 10));
    if (filters.user_id) params.set('user_id', filters.user_id);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return apiClient.get<PrayerListResponse>(`/prayers/admin/all?${params.toString()}`);
  },
  deletePrayer: (prayerId: string) => {
    return apiClient.delete(`/prayers/admin/${prayerId}`);
  },
};
