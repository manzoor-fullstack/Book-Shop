import { useState, useEffect } from 'react';
import { categoryService } from '@/services';
import { Category, CreateCategoryData } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories();
      setCategories(response.data.categories || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.createCategory(data);
      await fetchCategories();
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, createCategory, refetch: fetchCategories };
};
