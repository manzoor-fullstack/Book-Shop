import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export const wishlistService = {
  get: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.WISHLIST.GET);
    return res.data.data as any[];
  },

  add: async (bookId: number | string) => {
    const res = await axiosInstance.post(API_ENDPOINTS.WISHLIST.ADD, { bookId });
    return res.data.data;
  },

  remove: async (bookId: number | string) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.WISHLIST.REMOVE(bookId));
    return res.data;
  },
};
