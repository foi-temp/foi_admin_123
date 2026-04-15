import { create } from 'zustand';

interface AdminUser {
  user_id: string;
  phone_number?: string;
  full_name?: string;
  role?: string;
}

interface AdminState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
}

const getSafeUser = () => {
  try {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const useAdminStore = create<AdminState>((set) => ({
  user: getSafeUser(),
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
