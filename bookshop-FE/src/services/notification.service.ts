import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export const notificationService = {
  list: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return res.data.data as { notifications: AppNotification[]; unread: number };
  },
  markRead: async (id: number | string) => {
    const res = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return res.data;
  },
  markAllRead: async () => {
    const res = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return res.data;
  },
  clear: async () => {
    const res = await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR);
    return res.data;
  },
};
