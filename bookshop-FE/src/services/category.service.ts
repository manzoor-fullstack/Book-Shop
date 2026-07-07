import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { CategoriesResponse, CategoryResponse, CreateCategoryData } from '@/types';

export const categoryService = {
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await axiosInstance.get<CategoriesResponse>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    return response.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    const response = await axiosInstance.post<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
    return response.data;
  },
};
