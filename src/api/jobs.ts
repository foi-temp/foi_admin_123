import apiClient from './apiClient';

export interface Job {
  _id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  contact_email: string;
  contact_phone: string;
  application_link: string;
  deadline: string;
  experience_required: string;
  skills: string[];
  is_remote: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  status: boolean;
  total: number;
  page: number;
  limit: number;
  data: Job[];
}

export interface JobFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  job_type?: string;
}

export const jobsApi = {
  listJobs: (filters: JobFilters = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page || 1));
    params.set('limit', String(filters.limit || 10));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.job_type) params.set('job_type', filters.job_type);
    return apiClient.get<JobListResponse>(`/jobs/admin/all?${params.toString()}`);
  },

  verifyJob: (jobId: string, status: 'approved' | 'rejected') =>
    apiClient.post<{ status: boolean; message: string }>('/jobs/admin/verify', {
      job_id: jobId,
      status,
    }),
  deleteJob: (jobId: string) => {
    return apiClient.delete(`/jobs/admin/${jobId}`);
  },
};
