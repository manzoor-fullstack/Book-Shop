import axiosInstance from '@/api/axiosInstance';
import { API_ENDPOINTS } from '@/api/endpoints';
import { 
  BooksResponse, 
  BookResponse, 
  BookFilters,
  CreateBookData,
  UpdateBookData
} from '@/types';

export const bookService = {
  getBooks: async (filters?: BookFilters): Promise<BooksResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.category) params.append('category', filters.category.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    const response = await axiosInstance.get<BooksResponse>(
      `${API_ENDPOINTS.BOOKS.LIST}?${params.toString()}`
    );
    return response.data;
  },

  getBookById: async (id: string | number): Promise<BookResponse> => {
    const response = await axiosInstance.get<BookResponse>(
      API_ENDPOINTS.BOOKS.DETAIL(id)
    );
    return response.data;
  },

  createBook: async (data: CreateBookData): Promise<BookResponse> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.author) formData.append('author', data.author);
    if (data.description) formData.append('description', data.description);
    formData.append('price', data.price.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId.toString());
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post<BookResponse>(
      API_ENDPOINTS.BOOKS.CREATE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateBook: async (id: string | number, data: UpdateBookData): Promise<BookResponse> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.author) formData.append('author', data.author);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.put<BookResponse>(
      API_ENDPOINTS.BOOKS.UPDATE(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteBook: async (id: string | number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.BOOKS.DELETE(id));
    return response.data;
  },
};
