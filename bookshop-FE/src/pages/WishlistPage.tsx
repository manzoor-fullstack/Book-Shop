import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiBook,
  FiAlertCircle,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { wishlistService } from '@/services/wishlist.service';
import { cartService } from '@/services/cart.service';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<number | string, 'cart' | 'remove'>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    wishlistService
      .get()
      .then((data) => active && setItems(data || []))
      .catch(() => active && setError('We could not load your wishlist.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const setItemBusy = (bookId: number | string, state?: 'cart' | 'remove') =>
    setBusy((prev) => {
      const next = { ...prev };
      if (state) next[bookId] = state;
      else delete next[bookId];
      return next;
    });

  const handleAddToCart = async (bookId: number | string) => {
    setItemBusy(bookId, 'cart');
    try {
      await cartService.addToCart({ bookId: bookId as any, quantity: 1 });
      toast.success('Added to cart');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setItemBusy(bookId);
    }
  };

  const handleRemove = async (bookId: number | string) => {
    setItemBusy(bookId, 'remove');
    try {
      await wishlistService.remove(bookId);
      setItems((prev) => prev.filter((w) => (w.Book?.id ?? w.bookId) !== bookId));
      toast.success('Removed from wishlist');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not remove item');
    } finally {
      setItemBusy(bookId);
    }
  };

  return (
    <DashboardLayout title="Wishlist">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Books you have saved for later.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <EmptyState
              icon={<FiAlertCircle size={22} />}
              title="Something went wrong"
              description={error}
              action={
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              }
            />
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FiHeart size={22} />}
              title="Your wishlist is empty"
              description="Save books you love and find them here anytime."
              action={
                <Button onClick={() => navigate('/browse')} leftIcon={<FiBook size={16} />}>
                  Browse books
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((w) => {
              const book = w.Book || {};
              const bookId = book.id ?? w.bookId;
              const outOfStock = Number(book.stock) <= 0;
              const state = busy[bookId];
              return (
                <Card key={w.id} padded={false} hover className="flex flex-col overflow-hidden">
                  <div
                    className="relative aspect-[3/4] w-full cursor-pointer bg-slate-100 dark:bg-slate-800"
                    onClick={() => navigate('/browse')}
                  >
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-300 dark:text-slate-600">
                        <FiBook size={36} />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <Badge tone={outOfStock ? 'danger' : 'success'} dot>
                        {outOfStock ? 'Out of stock' : `${book.stock} in stock`}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {book.title || 'Untitled'}
                    </h3>
                    {book.author && (
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {book.author}
                      </p>
                    )}
                    <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {formatPrice(Number(book.price))}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Button
                        size="sm"
                        fullWidth
                        leftIcon={<FiShoppingCart size={14} />}
                        onClick={() => handleAddToCart(bookId)}
                        isLoading={state === 'cart'}
                        disabled={outOfStock || !!state}
                      >
                        {outOfStock ? 'Unavailable' : 'Add to cart'}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Remove from wishlist"
                        onClick={() => handleRemove(bookId)}
                        isLoading={state === 'remove'}
                        disabled={!!state}
                        className="flex-shrink-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        {state !== 'remove' && <FiTrash2 size={16} />}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WishlistPage;
