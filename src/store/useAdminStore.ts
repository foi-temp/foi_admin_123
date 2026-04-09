import { create } from 'zustand';

interface AdminState {
  user: {
    name: string;
    role: string;
    avatar?: string;
  } | null;
  isLoading: boolean;
  setUser: (user: AdminState['user']) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: {
    name: 'Admin User',
    role: 'Super Admin',
  },
  isLoading: false,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
