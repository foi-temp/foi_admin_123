import apiClient from './apiClient';

export interface MatrimonyProfile {
  _id: string;
  user_id: string;
  basic_details: {
    full_name: string;
    gender: string;
    date_of_birth: string;
    age: number;
    marital_status: string;
    profile_created_by: string;
  };
  faith_details: {
    religion: string;
    denomination: string;
    church_name: string;
    baptized: boolean;
    born_again: boolean;
    faith_level: string;
    ministry_involvement: string[];
  };
  personal_details: {
    height_cm: number;
    weight: number;
    body_type: string;
    complexion: string;
    physical_status: string;
  };
  education_career: {
    education: string;
    occupation: string;
    company_name: string;
    annual_income: string;
    work_location: string;
  };
  family_details: {
    father_name: string;
    father_occupation: string;
    mother_name: string;
    mother_occupation: string;
    siblings_count: number;
    family_status: string;
    family_type: string;
  };
  location: {
    country: string;
    state: string;
    city: string;
    native_place: string;
  };
  lifestyle: {
    diet: string;
    smoking: boolean;
    drinking: boolean;
    hobbies: string[];
  };
  about_me: string;
  partner_preferences: {
    preferred_age_min: number;
    preferred_age_max: number;
    preferred_height_min: number;
    preferred_height_max: number;
    preferred_marital_status: string[];
    preferred_denomination: string[];
    preferred_location: string[];
    expected_education: string;
    expected_faith_level: string;
  };
  profile_media: {
    profile_images: string[];
    video_intro: string;
  };
  faith_features: {
    daily_prayer_habit: boolean;
    bible_reading_frequency: string;
    favorite_verse: string;
    spiritual_goals: string[];
  };
  admin_status: {
    status: 'pending' | 'approved' | 'rejected';
    is_verified: boolean;
    approved_by: string | null;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatrimonyListResponse {
  status: boolean;
  total: number;
  page: number;
  limit: number;
  data: MatrimonyProfile[];
}

export interface MatrimonyFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  denomination?: string;
  date_from?: string;
  date_to?: string;
}

export const matrimonyApi = {
  listProfiles: (filters: MatrimonyFilters = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page || 1));
    params.set('limit', String(filters.limit || 10));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.denomination) params.set('denomination', filters.denomination);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    return apiClient.get<MatrimonyListResponse>(`/matrimony/admin/all?${params.toString()}`);
  },

  verifyProfile: (profileId: string, status: 'approved' | 'rejected') =>
    apiClient.post<{ status: boolean; message: string }>('/matrimony/admin/verify', {
      profile_id: profileId,
      status,
    }),
  deleteProfile: (id: string) => {
    return apiClient.delete(`/matrimony/admin/profile/${id}`);
  },
};
