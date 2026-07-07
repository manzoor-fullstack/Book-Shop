import type { Category } from './category.types';

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  price: number | string; // Backend returns string like "1000.00"
  image?: string;
  stock: number;
  categoryId: number;
  category?: Category;
  Category?: Category; // Backend returns this with capital C
  createdAt: string;
  updatedAt: string;
}

export interface BookFilters {
  search?: string;
  page?: number;
  limit?: number;
  category?: number | string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateBookData {
  title: string;
  author?: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: number;
  image?: File;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  image?: File;
}

export interface BooksResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    count: number;
    rows: Book[];
  };
}

export interface BookResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    book: Book;
  };
}
