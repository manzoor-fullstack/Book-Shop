import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface DashboardStats {
  totalBooks: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
}

export interface DashboardAnalytics {
  stats: DashboardStats;
  ordersByStatus: Record<string, number>;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  topBooks: { bookId: number; title: string; author: string; image?: string; sold: number; revenue: number }[];
  recentOrders: any[];
  lowStockBooks: { id: number; title: string; stock: number; image?: string }[];
}

export const analyticsService = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const res = await axiosInstance.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return res.data.data;
  },
};
