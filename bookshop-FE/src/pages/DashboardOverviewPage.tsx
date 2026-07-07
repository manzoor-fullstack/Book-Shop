import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBook,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowRight,
  FiHeart,
  FiShoppingCart,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AreaChart } from '@/components/charts/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { useAuthStore } from '@/store/authStore';
import { analyticsService, DashboardAnalytics } from '@/services/analytics.service';
import { orderService } from '@/services/order.service';
import { wishlistService } from '@/services/wishlist.service';
import { formatPrice, formatDateShort, formatNumber, orderStatusTone } from '@/utils/formatters';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#0ea5e9',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#f43f5e',
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ---------------- Admin Dashboard ---------------- */
const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (!data) return <EmptyState title="Could not load analytics" description="Please try again." />;

  const { stats, revenueSeries, ordersByStatus, topBooks, recentOrders, lowStockBooks } = data;

  const donutSegments = Object.entries(ordersByStatus).map(([label, value]) => ({
    label,
    value,
    color: STATUS_COLORS[label] || '#94a3b8',
  }));

  const revTrend = (() => {
    if (revenueSeries.length < 2) return 0;
    const last = revenueSeries[revenueSeries.length - 1].revenue;
    const prev = revenueSeries[revenueSeries.length - 2].revenue || 1;
    return Math.round(((last - prev) / prev) * 100);
  })();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={<FiDollarSign size={20} />}
          tone="emerald"
          trend={{ value: revTrend }}
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(stats.totalOrders)}
          icon={<FiShoppingBag size={20} />}
          tone="brand"
          footer={`${stats.pendingOrders} pending`}
        />
        <StatCard
          label="Customers"
          value={formatNumber(stats.totalCustomers)}
          icon={<FiUsers size={20} />}
          tone="violet"
        />
        <StatCard
          label="Books in Catalog"
          value={formatNumber(stats.totalBooks)}
          icon={<FiBook size={20} />}
          tone="sky"
          footer={`${stats.lowStockCount} low · ${stats.outOfStockCount} out`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue overview"
            subtitle="Last 7 days"
            action={
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                <FiTrendingUp size={16} /> {formatPrice(stats.totalRevenue)}
              </span>
            }
          />
          <AreaChart
            data={revenueSeries.map((r) => ({
              label: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
              value: Math.round(r.revenue),
            }))}
            valuePrefix="$"
          />
        </Card>

        <Card>
          <CardHeader title="Orders by status" />
          {donutSegments.length ? (
            <DonutChart
              segments={donutSegments}
              centerValue={stats.totalOrders}
              centerLabel="orders"
            />
          ) : (
            <EmptyState title="No orders yet" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            action={
              <Link to="/orders" className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            }
          />
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-2 py-2 font-medium">Order</th>
                    <th className="px-2 py-2 font-medium">Customer</th>
                    <th className="px-2 py-2 font-medium">Total</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-2 py-3 font-medium text-slate-800 dark:text-slate-200">
                        #{String(o.id).padStart(4, '0')}
                      </td>
                      <td className="px-2 py-3 text-slate-600 dark:text-slate-400">
                        {o.User ? `${o.User.firstName} ${o.User.lastName}` : '—'}
                      </td>
                      <td className="px-2 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(Number(o.totalAmount))}
                      </td>
                      <td className="px-2 py-3">
                        <Badge tone={orderStatusTone(o.status)} dot>
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Top sellers" />
            {topBooks.length === 0 ? (
              <EmptyState title="No sales yet" />
            ) : (
              <ul className="space-y-3">
                {topBooks.map((b, i) => (
                  <li key={b.bookId} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    {b.image ? (
                      <img src={b.image} alt="" className="h-9 w-7 rounded object-cover" />
                    ) : (
                      <div className="h-9 w-7 rounded bg-slate-100 dark:bg-slate-800" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{b.title}</p>
                      <p className="text-xs text-slate-400">{b.sold} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {formatPrice(b.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {lowStockBooks.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-500" /> Low stock
                  </span>
                }
              />
              <ul className="space-y-2.5">
                {lowStockBooks.map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-slate-700 dark:text-slate-300">{b.title}</span>
                    <Badge tone={b.stock === 0 ? 'danger' : 'warning'}>
                      {b.stock === 0 ? 'Out' : `${b.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

/* ---------------- Customer Dashboard ---------------- */
const CustomerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderService.getMyOrders(), wishlistService.get()])
      .then(([o, w]) => {
        setOrders((o.data as any) || []);
        setWishlistCount(w.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="My Orders" value={loading ? '—' : orders.length} icon={<FiShoppingBag size={20} />} tone="brand" />
        <StatCard label="Wishlist" value={loading ? '—' : wishlistCount} icon={<FiHeart size={20} />} tone="rose" />
        <StatCard label="Total Spent" value={formatPrice(totalSpent)} icon={<FiDollarSign size={20} />} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent orders"
            action={
              <Link to="/my-orders" className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<FiShoppingBag size={22} />}
              title="No orders yet"
              description="Browse our catalog and place your first order."
              action={
                <Link to="/browse" className="text-sm font-medium text-brand-600 hover:underline">
                  Browse books →
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">#{String(o.id).padStart(4, '0')}</p>
                    <p className="text-xs text-slate-400">{formatDateShort(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatPrice(Number(o.totalAmount))}</p>
                    <Badge tone={orderStatusTone(o.status)} dot>{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-brand-600 to-violet-600 text-white border-0">
          <h3 className="text-lg font-semibold">Discover your next read</h3>
          <p className="mt-1 text-sm text-white/80">Explore hundreds of titles across every genre.</p>
          <Link
            to="/browse"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2.5 text-sm font-medium backdrop-blur transition"
          >
            <FiShoppingCart size={16} /> Start shopping
          </Link>
        </Card>
      </div>
    </>
  );
};

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting()}, {user?.firstName || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? "Here's what's happening with your store today."
              : 'Welcome back to your BookShop dashboard.'}
          </p>
        </div>
        {isAdmin ? <AdminDashboard /> : <CustomerDashboard />}
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverviewPage;
