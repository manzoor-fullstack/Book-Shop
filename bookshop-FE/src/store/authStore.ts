import { create } from 'zustand';
import { AuthState, User, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  initialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
  initialized: false,

  // Rehydrate the logged-in user from the token on app load.
  initAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ initialized: true, isAuthenticated: false, user: null });
      return;
    }
    if (get().user) {
      set({ initialized: true });
      return;
    }
    try {
      const res = await authService.getProfile();
      set({
        user: res.data.user,
        isAuthenticated: true,
        initialized: true,
      });
    } catch {
      localStorage.removeItem('authToken');
      set({ user: null, token: null, isAuthenticated: false, initialized: true });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user: User | null) => set({ user }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
