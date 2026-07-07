import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingBag,
  FiChevronRight,
  FiPackage,
  FiAlertCircle,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDateShort, orderStatusTone, paymentTone } from '@/utils/formatters';

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orderNo = (id: number | string) => `#${String(id).padStart(4, '0')}`;

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderService
      .getMyOrders()
      .then((res) => {
        if (active) setOrders((res.data as any) || []);
      })
      .catch(() => active && setError('We could not load your orders. Please try again.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = status === 'all' || o.status === status;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(o.id).includes(q) ||
        orderNo(o.id).toLowerCase().includes(q) ||
        String(o.status).toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, status, search]);

  return (
    <DashboardLayout title="My Orders">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and review every order you have placed.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by order number or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<FiSearch size={16} />}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
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
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FiShoppingBag size={22} />}
              title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
              description={
                orders.length === 0
                  ? 'Browse our catalog and place your first order.'
                  : 'Try adjusting your search or filter.'
              }
              action={
                orders.length === 0 ? (
                  <Button onClick={() => navigate('/browse')} leftIcon={<FiShoppingBag size={16} />}>
                    Browse books
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => {
              const items = o.OrderItems || o.items || [];
              const itemCount = items.reduce(
                (n: number, it: any) => n + (Number(it.quantity) || 0),
                0
              );
              return (
                <Card
                  key={o.id}
                  hover
                  padded={false}
                  className="cursor-pointer p-4 sm:p-5"
                  onClick={() => navigate(`/order/${o.id}`)}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Thumbnails */}
                      <div className="flex -space-x-3 flex-shrink-0">
                        {items.slice(0, 3).map((it: any, idx: number) => {
                          const book = it.Book || it.book;
                          return book?.image ? (
                            <img
                              key={it.id || idx}
                              src={book.image}
                              alt=""
                              className="h-12 w-9 rounded-md object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
                            />
                          ) : (
                            <div
                              key={it.id || idx}
                              className="grid h-12 w-9 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 ring-2 ring-white dark:ring-slate-900"
                            >
                              <FiPackage size={16} />
                            </div>
                          );
                        })}
                        {items.length > 3 && (
                          <div className="grid h-12 w-9 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 ring-2 ring-white dark:ring-slate-900">
                            +{items.length - 3}
                          </div>
                        )}
                        {items.length === 0 && (
                          <div className="grid h-12 w-9 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <FiPackage size={16} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {orderNo(o.id)}
                          </p>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatDateShort(o.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {itemCount} item{itemCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={orderStatusTone(o.status)} dot>
                          {o.status}
                        </Badge>
                        {o.paymentStatus && (
                          <Badge tone={paymentTone(o.paymentStatus)}>{o.paymentStatus}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatPrice(Number(o.totalAmount))}
                        </p>
                      </div>
                      <FiChevronRight className="hidden sm:block text-slate-300 dark:text-slate-600" size={20} />
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

export default MyOrdersPage;
