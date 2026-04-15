import apiClient from './apiClient';

export interface LocationSuggestion {
  description: string;
  place_id: string;
}

export interface LocationDetails {
  address: string;
  latitude: number;
  longitude: number;
}

export const commonApi = {
  autocomplete: (input: string) => 
    apiClient.get<{ status: boolean; data: LocationSuggestion[] }>(`/common/location/autocomplete?input=${input}`),
    
  getLocationDetails: (placeId: string) => 
    apiClient.get<{ status: boolean; data: LocationDetails }>(`/common/location/details?place_id=${placeId}`),
};
