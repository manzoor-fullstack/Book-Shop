import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPackage,
  FiClock,
  FiRefreshCw,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiFileText,
  FiPrinter,
  FiAlertCircle,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Spinner';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate, orderStatusTone, paymentTone } from '@/utils/formatters';
import toast from 'react-hot-toast';

const orderNo = (id: number | string) => `#${String(id).padStart(4, '0')}`;

const STEPS = [
  { key: 'pending', label: 'Pending', icon: FiClock },
  { key: 'processing', label: 'Processing', icon: FiRefreshCw },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle },
];

/* ---------------- Status timeline ---------------- */
const StatusTimeline: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-500/20 dark:bg-rose-500/10">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
          <FiXCircle size={20} />
        </span>
        <div>
          <p className="font-semibold text-rose-700 dark:text-rose-300">Order cancelled</p>
          <p className="text-sm text-rose-600/80 dark:text-rose-400/80">
            This order was cancelled and will not be fulfilled.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-1 flex-col items-center text-center">
              <span
                className={[
                  'grid h-10 w-10 place-items-center rounded-full transition-colors',
                  done
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                  active ? 'ring-4 ring-brand-500/20' : '',
                ].join(' ')}
              >
                <Icon size={18} />
              </span>
              <p
                className={[
                  'mt-2 text-xs font-medium',
                  done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400',
                ].join(' ')}
              >
                {step.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mt-5 h-0.5 flex-1 min-w-4">
                <div
                  className={[
                    'h-full w-full rounded-full',
                    i < currentIndex ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800',
                  ].join(' ')}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ---------------- Invoice ---------------- */
const InvoiceView: React.FC<{ invoice: any }> = ({ invoice }) => {
  const { shop, customer, order, items = [], subtotal, total } = invoice;
  return (
    <div id="invoice-print" className="text-sm text-slate-700 dark:text-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{shop?.name || 'BookShop'}</h2>
          {shop?.address && <p className="text-slate-500 dark:text-slate-400">{shop.address}</p>}
          {shop?.email && <p className="text-slate-500 dark:text-slate-400">{shop.email}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">Invoice</p>
          <p className="font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</p>
          {invoice.issuedAt && (
            <p className="text-slate-500 dark:text-slate-400">{formatDate(invoice.issuedAt)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Billed to</p>
          <p className="font-medium text-slate-900 dark:text-white">
            {customer?.firstName} {customer?.lastName}
          </p>
          {customer?.email && <p className="text-slate-500 dark:text-slate-400">{customer.email}</p>}
          {customer?.phone && <p className="text-slate-500 dark:text-slate-400">{customer.phone}</p>}
          {customer?.address && <p className="text-slate-500 dark:text-slate-400">{customer.address}</p>}
        </div>
        <div className="sm:text-right">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Order</p>
          <p className="font-medium text-slate-900 dark:text-white">{orderNo(order?.id)}</p>
          <p className="text-slate-500 dark:text-slate-400">Status: {order?.status}</p>
          <p className="text-slate-500 dark:text-slate-400">Payment: {order?.paymentStatus}</p>
          {order?.paymentMethod && (
            <p className="text-slate-500 dark:text-slate-400">Method: {order.paymentMethod}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-slate-200 text-xs uppercase tracking-wider text-slate-400 dark:border-slate-800">
              <th className="py-2 pr-2 font-medium">Item</th>
              <th className="py-2 px-2 font-medium text-center">Qty</th>
              <th className="py-2 px-2 font-medium text-right">Price</th>
              <th className="py-2 pl-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((it: any, i: number) => (
              <tr key={i}>
                <td className="py-2.5 pr-2">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{it.title}</p>
                  {it.author && <p className="text-xs text-slate-400">{it.author}</p>}
                </td>
                <td className="py-2.5 px-2 text-center">{it.quantity}</td>
                <td className="py-2.5 px-2 text-right">{formatPrice(Number(it.price))}</td>
                <td className="py-2.5 pl-2 text-right font-medium">
                  {formatPrice(Number(it.lineTotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatPrice(Number(subtotal))}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white">Total</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatPrice(Number(total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invoice, setInvoice] = useState<any | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    orderService
      .getOrderById(id)
      .then((res) => {
        if (active) setOrder((res.data as any) || null);
      })
      .catch(() => active && setError('We could not load this order.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const openInvoice = async () => {
    if (!id) return;
    setInvoiceOpen(true);
    if (invoice) return;
    setInvoiceLoading(true);
    try {
      const data = await orderService.getInvoice(id);
      setInvoice(data);
    } catch {
      toast.error('Could not load invoice');
      setInvoiceOpen(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const printInvoice = () => window.print();

  if (loading) {
    return (
      <DashboardLayout title="Order">
        <div className="page-container">
          <PageLoader label="Loading order…" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Order">
        <div className="page-container">
          <Button variant="ghost" leftIcon={<FiArrowLeft size={16} />} onClick={() => navigate('/my-orders')} className="mb-4">
            Back to orders
          </Button>
          <Card>
            <EmptyState
              icon={<FiAlertCircle size={22} />}
              title="Order not found"
              description={error || 'This order does not exist or you do not have access to it.'}
              action={
                <Button variant="outline" onClick={() => navigate('/my-orders')}>
                  Back to orders
                </Button>
              }
            />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const items = order.OrderItems || order.items || [];
  const subtotal = items.reduce(
    (s: number, it: any) => s + Number(it.price) * Number(it.quantity),
    0
  );

  return (
    <DashboardLayout title={`Order ${orderNo(order.id)}`}>
      <div className="page-container">
        <Button
          variant="ghost"
          leftIcon={<FiArrowLeft size={16} />}
          onClick={() => navigate('/my-orders')}
          className="mb-4"
        >
          Back to orders
        </Button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{orderNo(order.id)}</h1>
              <Badge tone={orderStatusTone(order.status)} dot>
                {order.status}
              </Badge>
              {order.paymentStatus && (
                <Badge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Button variant="outline" leftIcon={<FiFileText size={16} />} onClick={openInvoice}>
            View invoice
          </Button>
        </div>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader title="Order status" />
          <StatusTimeline status={order.status} />
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items */}
          <Card className="lg:col-span-2">
            <CardHeader title="Items" subtitle={`${items.length} product${items.length === 1 ? '' : 's'}`} />
            {items.length === 0 ? (
              <EmptyState icon={<FiPackage size={22} />} title="No items in this order" />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-2 py-2 font-medium">Book</th>
                      <th className="px-2 py-2 font-medium text-center">Qty</th>
                      <th className="px-2 py-2 font-medium text-right">Price</th>
                      <th className="px-2 py-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((it: any) => {
                      const book = it.Book || it.book || {};
                      return (
                        <tr key={it.id}>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-3">
                              {book.image ? (
                                <img
                                  src={book.image}
                                  alt=""
                                  className="h-14 w-10 flex-shrink-0 rounded-md object-cover"
                                />
                              ) : (
                                <div className="grid h-14 w-10 flex-shrink-0 place-items-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                                  <FiPackage size={16} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                                  {book.title || 'Unknown book'}
                                </p>
                                {book.author && (
                                  <p className="truncate text-xs text-slate-400">{book.author}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-400">
                            {it.quantity}
                          </td>
                          <td className="px-2 py-3 text-right text-slate-600 dark:text-slate-400">
                            {formatPrice(Number(it.price))}
                          </td>
                          <td className="px-2 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                            {formatPrice(Number(it.price) * Number(it.quantity))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Sidebar: shipping + totals */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <FiMapPin size={16} className="text-slate-400" /> Shipping
                  </span>
                }
              />
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {order.shippingAddress || 'No shipping address provided.'}
              </p>
              {order.paymentMethod && (
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Payment method</p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 uppercase">
                    {order.paymentMethod}
                  </p>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader title="Summary" />
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Invoice modal */}
      <Modal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Invoice"
        description={invoice?.invoiceNumber}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
              Close
            </Button>
            <Button leftIcon={<FiPrinter size={16} />} onClick={printInvoice} disabled={!invoice}>
              Print
            </Button>
          </>
        }
      >
        {invoiceLoading || !invoice ? (
          <PageLoader label="Loading invoice…" />
        ) : (
          <InvoiceView invoice={invoice} />
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default OrderDetailPage;
