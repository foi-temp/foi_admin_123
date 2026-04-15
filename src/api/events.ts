import apiClient from './apiClient';

export interface VolunteerDetails {
  required_volunteers: number;
  roles: string[];
  deadline: string;
}

export interface EventPayload {
  title: string;
  category: string;
  description: string;
  date_time: string;
  location_address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  denomination: string;
  need_volunteers: boolean;
  volunteer_details?: VolunteerDetails;
}

export interface EventResponse {
  _id: string;
  title: string;
  category: string;
  description: string;
  date_time: string;
  location_address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  denomination: string;
  need_volunteers: boolean;
  volunteer_details?: VolunteerDetails;
  going_count: number;
  created_at: string;
  updated_at: string;
}

export const eventsApi = {
  createEvent: (payload: EventPayload) => 
    apiClient.post<{ status: boolean; data: EventResponse }>('/events/admin/create', payload),
    
  listEvents: (page = 1, limit = 20, search?: string, date?: string, category?: string, denomination?: string) => {
    let url = `/events/admin/list?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (date) url += `&date=${encodeURIComponent(date)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (denomination) url += `&denomination=${encodeURIComponent(denomination)}`;
    return apiClient.get<{ status: boolean; data: EventResponse[] }>(url);
  },
    
  getEvent: (id: string) => 
    apiClient.get<{ status: boolean; data: EventResponse }>(`/events/admin/${id}`),
    
  updateEvent: (id: string, payload: EventPayload) => 
    apiClient.put<{ status: boolean; message: string; data: EventResponse }>(`/events/admin/${id}`, payload),
};
