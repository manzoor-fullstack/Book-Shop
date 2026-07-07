import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface UserSettings {
  theme: string;
  emailNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}

export const settingsService = {
  get: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.SETTINGS.GET);
    return res.data.data as UserSettings;
  },
  update: async (data: Partial<UserSettings>) => {
    const res = await axiosInstance.put(API_ENDPOINTS.SETTINGS.UPDATE, data);
    return res.data.data as UserSettings;
  },
};
