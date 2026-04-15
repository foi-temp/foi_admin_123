import apiClient from './apiClient';

export interface DashboardStats {
  total: number;
  growth: number;
}

export interface ActivityAnalytics {
  date: string;
  users: number;
  prayers: number;
  jobs: number;
  matrimony: number;
}

export interface DashboardResponse {
  status: boolean;
  users: DashboardStats;
  prayers: DashboardStats;
  jobs: DashboardStats;
  matrimony: DashboardStats;
  activity_analytics: ActivityAnalytics[];
}

export const dashboardApi = {
  getDashboardData: () => {
    return apiClient.get<DashboardResponse>('/admin/dashboard');
  },
};
