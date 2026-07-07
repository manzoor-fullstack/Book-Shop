import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiBook,
  FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import { cartService } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { formatPrice } from '@/utils/formatters';
import type { Book } from '@/types/book.types';
import type { Category } from '@/types/category.types';

const PAGE_SIZE = 12;

const CoverPlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={
      'flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/20 via-violet-500/15 to-sky-500/20 text-brand-500/70 dark:text-brand-300/60 ' +
      (className || '')
    }
  >
    <FiBook size={44} />
  </div>
);

const BookCardSkeleton: React.FC = () => (
  <Card padded={false} className="overflow-hidden">
    <Skeleton className="aspect-[3/4] w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </Card>
);

export const BrowseBooksPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [addingId, setAddingId] = useState<number | null>(null);

  // Debounce the search input.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load categories + wishlist once.
  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
    wishlistService
      .get()
      .then((items) => setWishlistIds(new Set(items.map((w: any) => w.bookId))))
      .catch(() => {});
  }, []);

  const reqRef = useRef(0);
  useEffect(() => {
    const reqId = ++reqRef.current;
    setLoading(true);
    bookService
      .getBooks({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
        category: categoryId ? Number(categoryId) : undefined,
      })
      .then((res) => {
        if (reqRef.current !== reqId) return;
        setBooks(res.data.rows || []);
        setTotal(res.data.count || 0);
      })
      .catch((err: any) => {
        if (reqRef.current !== reqId) return;
        toast.error(err?.response?.data?.message || 'Failed to load books');
        setBooks([]);
        setTotal(0);
      })
      .finally(() => {
        if (reqRef.current === reqId) setLoading(false);
      });
  }, [search, categoryId, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const handleAddToCart = async (book: Book) => {
    setAddingId(book.id);
    try {
      await cartService.addToCart({ bookId: book.id, quantity: 1 });
      toast.success(`"${book.title}" added to cart`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const toggleWishlist = async (book: Book) => {
    const isWished = wishlistIds.has(book.id);
    // Optimistic update.
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isWished) next.delete(book.id);
      else next.add(book.id);
      return next;
    });
    try {
      if (isWished) {
        await wishlistService.remove(book.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.add(book.id);
        toast.success('Added to wishlist');
      }
    } catch (err: any) {
      // Revert.
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWished) next.add(book.id);
        else next.delete(book.id);
        return next;
      });
      toast.error(err?.response?.data?.message || 'Failed to update wishlist');
    }
  };

  return (
    <DashboardLayout title="Browse Books">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Books</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Explore our full catalog and add your favorites to the cart.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6" padded>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search by title or author…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<FiSearch size={18} />}
              />
            </div>
            <div className="sm:w-64">
              <Select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FiFilter size={22} />}
              title="No books found"
              description="Try adjusting your search or category filter."
              action={
                (search || categoryId) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                      setCategoryId('');
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => {
                const stock = Number(book.stock);
                const outOfStock = stock <= 0;
                const lowStock = stock > 0 && stock < 10;
                const wished = wishlistIds.has(book.id);
                const categoryName = book.Category?.name || book.category?.name;

                return (
                  <Card
                    key={book.id}
                    padded={false}
                    hover
                    className="group flex flex-col overflow-hidden"
                  >
                    {/* Cover */}
                    <div className="relative">
                      <Link
                        to={`/book/${book.id}`}
                        className="block aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                      >
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <CoverPlaceholder />
                        )}
                      </Link>

                      {/* Wishlist heart */}
                      <button
                        type="button"
                        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={() => toggleWishlist(book)}
                        className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-rose-500 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <FiHeart
                          size={18}
                          className={wished ? 'fill-rose-500 text-rose-500' : ''}
                        />
                      </button>

                      {/* Stock badge */}
                      {outOfStock ? (
                        <span className="absolute left-2.5 top-2.5">
                          <Badge tone="danger">Out of stock</Badge>
                        </span>
                      ) : lowStock ? (
                        <span className="absolute left-2.5 top-2.5">
                          <Badge tone="warning">Only {stock} left</Badge>
                        </span>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <Link to={`/book/${book.id}`} className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {book.author || 'Unknown author'}
                      </p>

                      {categoryName && (
                        <div className="mt-2">
                          <Badge tone="brand">{categoryName}</Badge>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatPrice(Number(book.price))}
                        </span>
                        <Button
                          size="sm"
                          leftIcon={<FiShoppingCart size={15} />}
                          disabled={outOfStock}
                          isLoading={addingId === book.id}
                          onClick={() => handleAddToCart(book)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrowseBooksPage;
