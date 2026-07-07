import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiBook,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cartService } from '@/services/cart.service';
import { formatPrice } from '@/utils/formatters';
import type { CartItem } from '@/types/cart.types';

const CoverPlaceholder: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/20 via-violet-500/15 to-sky-500/20 text-brand-500/70 dark:text-brand-300/60">
    <FiBook size={24} />
  </div>
);

export const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CartItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setItems(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantity = async (item: CartItem, next: number) => {
    if (next < 1 || next > Number(item.Book.stock)) return;
    setUpdatingId(item.id);
    // Optimistic update.
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: next } : i)));
    try {
      await cartService.updateCartItem(item.id, { quantity: next });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update quantity');
      loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await cartService.removeFromCart(removeTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== removeTarget.id));
      toast.success('Item removed from cart');
      setRemoveTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemoving(false);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.Book.price) * i.quantity, 0);

  return (
    <DashboardLayout title="Shopping Cart">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? 'Loading your cart…'
              : items.length === 0
              ? 'Your cart is empty.'
              : `${itemCount} item${itemCount === 1 ? '' : 's'} in your cart.`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="flex gap-4" padded>
                  <Skeleton className="h-28 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                  </div>
                </Card>
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FiShoppingCart size={22} />}
              title="Your cart is empty"
              description="Browse our catalog and add books you love to your cart."
              action={
                <Button leftIcon={<FiArrowRight />} onClick={() => navigate('/browse')}>
                  Browse books
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <Card padded={false}>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => {
                    const price = Number(item.Book.price);
                    const stock = Number(item.Book.stock);
                    return (
                      <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                        <Link
                          to={`/book/${item.bookId}`}
                          className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
                        >
                          {item.Book.image ? (
                            <img
                              src={item.Book.image}
                              alt={item.Book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <CoverPlaceholder />
                          )}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/book/${item.bookId}`}
                                className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white"
                              >
                                {item.Book.title}
                              </Link>
                              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                {item.Book.author || 'Unknown author'}
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatPrice(price)}
                              </p>
                              {stock < 10 && stock > 0 && (
                                <span className="mt-1.5 inline-block">
                                  <Badge tone="warning">Only {stock} left</Badge>
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => setRemoveTarget(item)}
                              aria-label="Remove item"
                              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>

                          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                            <div className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => handleQuantity(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingId === item.id}
                                className="grid h-9 w-9 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <FiMinus size={15} />
                              </button>
                              <span className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => handleQuantity(item, item.quantity + 1)}
                                disabled={item.quantity >= stock || updatingId === item.id}
                                className="grid h-9 w-9 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <FiPlus size={15} />
                              </button>
                            </div>

                            <span className="text-base font-bold text-slate-900 dark:text-white">
                              {formatPrice(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Link
                to="/browse"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <FiArrowLeft size={15} /> Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-6">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Order summary
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Items ({itemCount})
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-slate-800">
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <Button
                  fullWidth
                  className="mt-5"
                  rightIcon={<FiArrowRight size={16} />}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!removeTarget}
        title="Remove item"
        message={
          removeTarget
            ? `Remove "${removeTarget.Book.title}" from your cart?`
            : ''
        }
        confirmText="Remove"
        type="danger"
        isLoading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </DashboardLayout>
  );
};

export default CartPage;
