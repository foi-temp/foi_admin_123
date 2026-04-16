import apiClient from './apiClient';

export interface AppUser {
  _id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  dob: string | null;
  gender: string;
  location: string | null;
  happiness_level: string;
  guide_choice: string;
  is_specific_denomination: boolean;
  denomination: string;
  goals: string[];
  bible_version: string;
  language: string;
  is_phone_verified: boolean;
  is_matrimony_profile_created: boolean;
  is_profile_setup_complete: boolean;
  otp_code: string | null;
  otp_expiry: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  status: boolean;
  total: number;
  page: number;
  limit: number;
  data: AppUser[];
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  denomination?: string;
  is_profile_setup_complete?: boolean;
  date_from?: string;
  date_to?: string;
}

export const usersApi = {
  listUsers: (filters: UserFilters = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page || 1));
    params.set('limit', String(filters.limit || 10));
    if (filters.search) params.set('search', filters.search);
    if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active));
    if (filters.denomination) params.set('denomination', filters.denomination);
    if (filters.is_profile_setup_complete !== undefined)
      params.set('is_profile_setup_complete', String(filters.is_profile_setup_complete));
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return apiClient.get<UserListResponse>(`/users/admin/all?${params.toString()}`);
  },

  getUser: (userId: string) =>
    apiClient.get<AppUser>(`/users/admin/${userId}`),

  revokeUser: (userId: string, isActive: boolean) =>
    apiClient.patch<{ [key: string]: any }>(`/users/admin/${userId}/revoke?is_active=${isActive}`),
  deleteUser: (userId: string) => {
    return apiClient.delete(`/users/admin/${userId}`);
  },
};
