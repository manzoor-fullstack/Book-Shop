import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';

export interface Review {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  User?: { id: number; firstName: string; lastName: string; profileImage?: string | null };
}

export const reviewService = {
  getForBook: async (bookId: number | string) => {
    const res = await axiosInstance.get(API_ENDPOINTS.REVIEWS.BY_BOOK(bookId));
    return res.data.data as { reviews: Review[]; average: number; count: number };
  },

  submit: async (bookId: number | string, data: { rating: number; comment?: string }) => {
    const res = await axiosInstance.post(API_ENDPOINTS.REVIEWS.BY_BOOK(bookId), data);
    return res.data.data;
  },

  remove: async (id: number | string) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.REVIEWS.DELETE(id));
    return res.data;
  },
};
