import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBook,
  FiArrowLeft,
  FiTruck,
  FiCreditCard,
  FiCheck,
  FiMapPin,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { formatPrice } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import type { CartItem } from '@/types/cart.types';

type PaymentMethod = 'cod' | 'card';

const CoverPlaceholder: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/20 via-violet-500/15 to-sky-500/20 text-brand-500/70 dark:text-brand-300/60">
    <FiBook size={18} />
  </div>
);

const PaymentOption: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ active, onClick, icon, title, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
      active
        ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/40 dark:bg-brand-500/10'
        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
    )}
  >
    <span
      className={cn(
        'grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg',
        active
          ? 'bg-brand-600 text-white'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      )}
    >
      {icon}
    </span>
    <div className="flex-1">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <span
      className={cn(
        'mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2',
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 dark:border-slate-600'
      )}
    >
      {active && <FiCheck size={12} />}
    </span>
  </button>
);

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    let cancelled = false;
    cartService
      .getCart()
      .then((res) => {
        if (cancelled) return;
        const cartItems = res.data || [];
        if (cartItems.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setItems(cartItems);
      })
      .catch((err: any) => {
        if (cancelled) return;
        toast.error(err?.response?.data?.message || 'Failed to load cart');
        navigate('/cart');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (user?.address) setShippingAddress((prev) => prev || user.address || '');
  }, [user]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.Book.price) * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setAddressError('Please enter a shipping address');
      return;
    }
    setAddressError('');
    setPlacing(true);
    try {
      const res = await orderService.createOrder({
        paymentMethod,
        shippingAddress: shippingAddress.trim(),
      });
      const newOrder = res.data as any;
      toast.success('Order placed successfully!');
      navigate(`/order/${newOrder.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Checkout">
        <div className="page-container">
          <Skeleton className="mb-6 h-9 w-32 rounded-lg" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-52 rounded-2xl" />
            </div>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Checkout">
      <div className="page-container">
        <button
          onClick={() => navigate('/cart')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
        >
          <FiArrowLeft size={16} /> Back to cart
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Checkout</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review your details and place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: shipping + payment */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <FiMapPin size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Shipping address
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>
              <Textarea
                placeholder="Street address, city, postal code…"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                error={addressError}
                className="min-h-[110px]"
              />
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <FiCreditCard size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Payment method
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how you'd like to pay.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PaymentOption
                  active={paymentMethod === 'cod'}
                  onClick={() => setPaymentMethod('cod')}
                  icon={<FiTruck size={18} />}
                  title="Cash on Delivery"
                  description="Pay when your order arrives."
                />
                <PaymentOption
                  active={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
                  icon={<FiCreditCard size={18} />}
                  title="Card"
                  description="Pay securely by card."
                />
              </div>
            </Card>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Order summary
              </h2>

              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                      {item.Book.image ? (
                        <img
                          src={item.Book.image}
                          alt={item.Book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CoverPlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.Book.title}
                      </p>
                      <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {formatPrice(Number(item.Book.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-3 border-t border-slate-200/70 pt-4 dark:border-slate-800">
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
                leftIcon={<FiCheck size={16} />}
                isLoading={placing}
                onClick={handlePlaceOrder}
              >
                Place order
              </Button>
              <p className="mt-3 text-center text-xs text-slate-400">
                By placing this order you agree to our terms.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckoutPage;
