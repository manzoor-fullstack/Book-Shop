import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export const customerService = {
  list: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.search) qs.append('search', params.search);
    if (params?.role) qs.append('role', params.role);
    const res = await axiosInstance.get(`${API_ENDPOINTS.USERS.LIST}?${qs.toString()}`);
    return res.data.data as { count: number; page: number; limit: number; users: Customer[] };
  },

  detail: async (id: number | string) => {
    const res = await axiosInstance.get(API_ENDPOINTS.USERS.DETAIL(id));
    return res.data.data;
  },

  toggleActive: async (id: number | string) => {
    const res = await axiosInstance.patch(API_ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
    return res.data.data;
  },

  updateRole: async (id: number | string, role: 'user' | 'admin') => {
    const res = await axiosInstance.patch(API_ENDPOINTS.USERS.ROLE(id), { role });
    return res.data.data;
  },
};
