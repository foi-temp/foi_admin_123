import apiClient from './apiClient';

export interface Announcement {
  _id: string;
  title: string;
  subtitle: string;
  denomination: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementPayload {
  title: string;
  subtitle: string;
  denomination: string;
}

export type MultiAnnouncementResponse = Record<string, Announcement | null>;

export const announcementsApi = {
  getAllLatest: () => {
    return apiClient.get<MultiAnnouncementResponse>('/announcements/admin/latest-all');
  },
  create: (payload: AnnouncementPayload) => {
    return apiClient.post<Announcement>('/announcements/admin/create', payload);
  },
  delete: (id: string) => {
    return apiClient.delete(`/announcements/admin/${id}`);
  },
};
