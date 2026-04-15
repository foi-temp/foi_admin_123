import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'Something went wrong';
    const detail = error.response?.data?.detail;
    
    if (typeof detail === 'string') {
      errorMessage = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      errorMessage = detail[0].msg || 'Validation error';
    } else {
      errorMessage = error.response?.data?.message || 'Something went wrong';
    }
    
    message.error(errorMessage);

    if (error.response?.status === 401) {
      // Handle logout
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
