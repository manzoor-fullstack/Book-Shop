import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiBook,
  FiAlertTriangle,
  FiTrendingUp,
  FiArrowRight,
  FiAward,
  FiPackage,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AreaChart } from '@/components/charts/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { analyticsService, DashboardAnalytics } from '@/services/analytics.service';
import { formatPrice, formatNumber } from '@/utils/formatters';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#0ea5e9',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#f43f5e',
};

const RANK_STYLES = ['text-amber-500', 'text-slate-400', 'text-orange-400'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    analyticsService
      .getDashboard()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="page-container">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title="Analytics">
        <div className="page-container">
          <Card>
            <EmptyState
              icon={<FiTrendingUp size={22} />}
              title="Could not load analytics"
              description="Something went wrong while fetching your store insights. Please try again."
            />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, revenueSeries, ordersByStatus, topBooks, lowStockBooks } = data;

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

  const maxSold = Math.max(...topBooks.map((b) => b.sold), 1);

  return (
    <DashboardLayout title="Analytics">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A deep dive into your store performance.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={<FiDollarSign size={20} />}
            tone="emerald"
            trend={{ value: revTrend }}
          />
          <StatCard
            label="Orders"
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
            label="Books"
            value={formatNumber(stats.totalBooks)}
            icon={<FiBook size={20} />}
            tone="sky"
            footer={`${stats.totalCategories} categories`}
          />
          <StatCard
            label="Low Stock"
            value={formatNumber(stats.lowStockCount)}
            icon={<FiAlertTriangle size={20} />}
            tone="amber"
            footer={`${stats.outOfStockCount} out of stock`}
          />
        </div>

        {/* Revenue + donut */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
            {revenueSeries.length ? (
              <AreaChart
                data={revenueSeries.map((r) => ({
                  label: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
                  value: Math.round(r.revenue),
                }))}
                valuePrefix="$"
                color="#10b981"
              />
            ) : (
              <EmptyState title="No revenue data yet" />
            )}
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

        {/* Top sellers + low stock */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <FiAward className="text-amber-500" /> Top sellers
                </span>
              }
              action={
                <Link
                  to="/books"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                >
                  View catalog <FiArrowRight size={14} />
                </Link>
              }
            />
            {topBooks.length === 0 ? (
              <EmptyState icon={<FiAward size={22} />} title="No sales yet" />
            ) : (
              <ul className="space-y-4">
                {topBooks.map((b, i) => (
                  <li key={b.bookId} className="flex items-center gap-3">
                    <span
                      className={`w-5 text-center text-sm font-bold ${
                        RANK_STYLES[i] || 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {b.image ? (
                      <img src={b.image} alt="" className="h-11 w-8 rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                    ) : (
                      <div className="grid h-11 w-8 place-items-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <FiBook size={14} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {b.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">{b.author}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.max((b.sold / maxSold) * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(b.revenue)}
                      </p>
                      <p className="text-xs text-slate-400">{formatNumber(b.sold)} sold</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <FiAlertTriangle className="text-amber-500" /> Low stock
                </span>
              }
              action={
                <Link
                  to="/books"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                >
                  Manage <FiArrowRight size={14} />
                </Link>
              }
            />
            {lowStockBooks.length === 0 ? (
              <EmptyState icon={<FiPackage size={22} />} title="All stocked up" description="No low-stock items right now." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockBooks.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-2.5">
                    {b.image ? (
                      <img src={b.image} alt="" className="h-9 w-7 rounded object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                    ) : (
                      <div className="grid h-9 w-7 place-items-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <FiBook size={12} />
                      </div>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
                      {b.title}
                    </span>
                    <Badge tone={b.stock === 0 ? 'danger' : 'warning'} dot>
                      {b.stock === 0 ? 'Out' : `${b.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
