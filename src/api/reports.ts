import apiClient from './apiClient';

export interface ReportTarget {
  id: string;
  type: string;
  display_name: string;
  image: string;
  description: string;
}

export interface IndividualReport {
  id: string;
  reporter_id: string;
  reason: string;
  comment: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface GroupedReport {
  target: ReportTarget;
  report_count: number;
  reports: IndividualReport[];
}

export interface GroupedReportsResponse {
  status: boolean;
  page: number;
  limit: number;
  pending_count: number;
  resolved_count: number;
  data: GroupedReport[];
}

export const reportsApi = {
  getGroupedReports: (params: { page?: number; limit?: number; status?: string }) => {
    return apiClient.get<GroupedReportsResponse>('/reports/admin/grouped', { params });
  },
  updateReportStatus: (reportId: string, status: string) => {
    return apiClient.patch(`/reports/admin/${reportId}/status`, { status });
  },
  bulkUpdateReportStatus: (reportIds: string[], status: string) => {
    return apiClient.post('/reports/admin/bulk-update', { report_ids: reportIds, status });
  },
};
