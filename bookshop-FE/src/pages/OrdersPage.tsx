import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiPackage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDateShort, paymentTone } from '@/utils/formatters';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof STATUS_OPTIONS)[number];

// Normalize an order regardless of backend casing (User/user, OrderItems/items)
const normalize = (o: any) => {
  const user = o.User || o.user || {};
  const items = o.OrderItems || o.items || [];
  return {
    id: o.id,
    status: o.status as OrderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    total: Number(o.totalAmount) || 0,
    createdAt: o.createdAt,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown',
    email: user.email || '',
    itemCount: Array.isArray(items) ? items.length : 0,
  };
};

type Row = ReturnType<typeof normalize>;

const RowSkeletons: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
        <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded" /></td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
        </td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-12 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
        <td className="px-4 py-3"><Skeleton className="h-8 w-28 rounded-lg" /></td>
      </tr>
    ))}
  </>
);

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    orderService
      .getAllOrders()
      .then((res: any) => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setOrders(arr.map(normalize));
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = !statusFilter || o.status === statusFilter;
      const matchesSearch =
        !q ||
        String(o.id).includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    return { total, pending, revenue };
  }, [orders]);

  const changeStatus = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    // optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await orderService.updateOrderStatus(id, { status });
      toast.success(`Order #${String(id).padStart(4, '0')} → ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
      load(); // revert on failure
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout title="Orders">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track and manage customer orders.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Orders"
            value={loading ? '—' : stats.total}
            icon={<FiShoppingBag size={20} />}
            tone="brand"
          />
          <StatCard
            label="Pending"
            value={loading ? '—' : stats.pending}
            icon={<FiClock size={20} />}
            tone="amber"
          />
          <StatCard
            label="Revenue"
            value={loading ? '—' : formatPrice(stats.revenue)}
            icon={<FiDollarSign size={20} />}
            tone="emerald"
          />
        </div>

        <Card padded={false}>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="sm:max-w-xs sm:flex-1">
              <Input
                leftIcon={<FiSearch size={16} />}
                placeholder="Search order # or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="hidden text-sm text-slate-400 sm:ml-auto sm:block">
              {loading ? '…' : `${filtered.length} order${filtered.length === 1 ? '' : 's'}`}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <RowSkeletons />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={<FiPackage size={22} />}
                        title="No orders found"
                        description={
                          search || statusFilter
                            ? 'Try adjusting your search or filter.'
                            : 'Orders will appear here once customers start buying.'
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/order/${o.id}`)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          #{String(o.id).padStart(4, '0')}
                        </div>
                        <div className="text-xs text-slate-400">{formatDateShort(o.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {o.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">{o.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        {o.paymentStatus ? (
                          <Badge tone={paymentTone(o.paymentStatus)} dot>
                            {o.paymentStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      {/* Stop row-navigation when interacting with the status dropdown */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              o.status === 'delivered'
                                ? 'bg-emerald-500'
                                : o.status === 'cancelled'
                                ? 'bg-rose-500'
                                : o.status === 'shipped'
                                ? 'bg-violet-500'
                                : o.status === 'processing'
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <select
                            value={o.status}
                            disabled={updatingId === o.id}
                            onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                            className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium capitalize text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
