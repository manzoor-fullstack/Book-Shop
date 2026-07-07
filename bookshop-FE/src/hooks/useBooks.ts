import { useState, useEffect } from 'react';
import { bookService } from '@/services';
import { Book, BookFilters } from '@/types';

export const useBooks = (filters?: BookFilters) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getBooks(filters);
      setBooks(response.data.rows || []);
      // Calculate pagination from count and filters
      if (filters?.limit && response.data.count) {
        setPagination({
          currentPage: filters.page || 1,
          totalPages: Math.ceil(response.data.count / filters.limit),
          totalBooks: response.data.count,
          limit: filters.limit,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters?.search, filters?.page, filters?.limit]);

  return { books, loading, error, pagination, refetch: fetchBooks };
};

export const useBook = (id: string | number) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getBookById(id);
      setBook(response.data.book);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  return { book, loading, error, refetch: fetchBook };
};
