import apiClient from './apiClient';

export interface VolunteerApplication {
  application_id: string;
  event_id: string;
  user_id: string;
  full_name: string;
  phone: string;
  availability: string;
  experience: string;
  role: string;
  denomination: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  event_title: string;
  event_category: string;
  event_date_time: string;
}

export interface VolunteerListResponse {
  status: boolean;
  total: number;
  page: number;
  limit: number;
  data: VolunteerApplication[];
}

export interface VolunteerFilters {
  page?: number;
  limit?: number;
  category?: string;
  denomination?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
}

export const volunteersApi = {
  listApplications: (filters: VolunteerFilters = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page || 1));
    params.set('limit', String(filters.limit || 20));
    if (filters.category) params.set('category', filters.category);
    if (filters.denomination) params.set('denomination', filters.denomination);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.status) params.set('status', filters.status);
    return apiClient.get<VolunteerListResponse>(`/volunteers/admin/applications?${params.toString()}`);
  },

  updateStatus: (applicationId: string, status: 'approved' | 'rejected') =>
    apiClient.patch<{ status: boolean; message: string }>(
      `/volunteers/admin/applications/${applicationId}/status?status=${status}`
    ),
};
