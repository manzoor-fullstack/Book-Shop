import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch,
  FiUsers,
  FiMail,
  FiPhone,
  FiUserCheck,
  FiUserX,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { customerService, Customer } from '@/services/customer.service';
import { formatPrice, formatNumber, formatDateShort } from '@/utils/formatters';

const PAGE_SIZE = 10;

const fullName = (c: Customer) => `${c.firstName} ${c.lastName}`.trim();

const RowSkeletons: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
        </td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-10 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
        <td className="px-4 py-3"><Skeleton className="ml-auto h-8 w-20 rounded-lg" /></td>
      </tr>
    ))}
  </>
);

/* ---------------- Detail modal ---------------- */
const CustomerDetailModal: React.FC<{
  customer: Customer | null;
  onClose: () => void;
}> = ({ customer, onClose }) => {
  const [detail, setDetail] = useState<Customer | null>(customer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setDetail(customer);
    setLoading(true);
    customerService
      .detail(customer.id)
      .then((d) => d && setDetail(d as Customer))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customer]);

  if (!customer) return null;
  const c = detail || customer;

  return (
    <Modal isOpen={!!customer} onClose={onClose} title="Customer details" size="md">
      <div className="flex items-center gap-4">
        <Avatar src={c.profileImage} name={fullName(c)} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
              {fullName(c)}
            </h3>
            <Badge tone={c.role === 'admin' ? 'purple' : 'gray'}>{c.role}</Badge>
          </div>
          <Badge tone={c.isActive ? 'success' : 'danger'} dot>
            {c.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <FiMail className="text-slate-400" />
          <span className="truncate text-slate-700 dark:text-slate-300">{c.email || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FiPhone className="text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{c.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FiMapPin className="text-slate-400" />
          <span className="truncate text-slate-700 dark:text-slate-300">{c.address || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FiCalendar className="text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">
            Joined {c.createdAt ? formatDateShort(c.createdAt) : '—'}
          </span>
        </div>
      </dl>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-400">Orders</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {loading ? '…' : formatNumber(c.orderCount ?? 0)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-400">Total spent</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {loading ? '…' : formatPrice(c.totalSpent ?? 0)}
          </p>
        </div>
      </div>
    </Modal>
  );
};

/* ---------------- Page ---------------- */
export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Customer | null>(null);
  const [toggling, setToggling] = useState(false);
  const [roleBusyId, setRoleBusyId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = () => {
    setLoading(true);
    customerService
      .list({
        page,
        limit: PAGE_SIZE,
        search: debounced || undefined,
        role: roleFilter || undefined,
      })
      .then((res) => {
        setCustomers(res.users || []);
        setCount(res.count || 0);
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debounced, page, roleFilter]);

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await customerService.toggleActive(toggleTarget.id);
      toast.success(
        toggleTarget.isActive ? 'Customer deactivated' : 'Customer activated'
      );
      setToggleTarget(null);
      load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update customer');
    } finally {
      setToggling(false);
    }
  };

  const changeRole = async (c: Customer, role: 'user' | 'admin') => {
    if (c.role === role) return;
    setRoleBusyId(c.id);
    setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, role } : x)));
    try {
      await customerService.updateRole(c.id, role);
      toast.success(`Role updated to ${role}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role');
      load();
    } finally {
      setRoleBusyId(null);
    }
  };

  const showingRange = useMemo(() => {
    if (count === 0) return '0';
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, count);
    return `${start}–${end}`;
  }, [page, count]);

  return (
    <DashboardLayout title="Customers">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage customer accounts, roles and access.
          </p>
        </div>

        <Card padded={false}>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div className="sm:max-w-xs sm:flex-1">
              <Input
                leftIcon={<FiSearch size={16} />}
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-44">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="hidden text-sm text-slate-400 sm:ml-auto sm:block">
              {loading ? '…' : `${showingRange} of ${formatNumber(count)}`}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Spent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <RowSkeletons />
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={<FiUsers size={22} />}
                        title="No customers found"
                        description={
                          debounced || roleFilter
                            ? 'Try adjusting your search or filter.'
                            : 'Customers will appear here once they sign up.'
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setDetailCustomer(c)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={c.profileImage} name={fullName(c)} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {fullName(c) || 'Unnamed'}
                            </p>
                            <p className="truncate text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {c.phone || '—'}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.role}
                          disabled={roleBusyId === c.id}
                          onChange={(e) => changeRole(c, e.target.value as 'user' | 'admin')}
                          className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium capitalize text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatNumber(c.orderCount ?? 0)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(c.totalSpent ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={c.isActive ? 'success' : 'danger'} dot>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant={c.isActive ? 'outline' : 'success'}
                            leftIcon={
                              c.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />
                            }
                            onClick={() => setToggleTarget(c)}
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && customers.length > 0 && totalPages > 1 && (
            <div className="border-t border-slate-200/70 p-4 dark:border-slate-800">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <CustomerDetailModal
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
      />

      <ConfirmDialog
        isOpen={!!toggleTarget}
        title={toggleTarget?.isActive ? 'Deactivate customer' : 'Activate customer'}
        message={
          toggleTarget?.isActive
            ? `Deactivate ${toggleTarget ? fullName(toggleTarget) : ''}? They will lose access to their account.`
            : `Activate ${toggleTarget ? fullName(toggleTarget) : ''}? They will regain access to their account.`
        }
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        type={toggleTarget?.isActive ? 'danger' : 'info'}
        isLoading={toggling}
        onConfirm={confirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </DashboardLayout>
  );
};

export default CustomersPage;
