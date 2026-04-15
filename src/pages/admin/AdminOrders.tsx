import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, AlertCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { useAdminPlans } from '@/hooks/admin/useAdminPlans';
import { ShoppingCart } from 'lucide-react';

const orderStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'processing', label: 'Processing' },
  { value: 'review_pending', label: 'Review Pending' },
  { value: 'available', label: 'Available' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentStatusOptions = [
  { value: 'all', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount: string, currency: string) {
  return `$${parseFloat(amount).toFixed(2)} ${currency}`;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [planId, setPlanId] = useState('all');
  const [page, setPage] = useState(1);

  const { data: plans } = useAdminPlans();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [debouncedQuery, orderStatus, paymentStatus, planId]);

  const params = {
    query: debouncedQuery || undefined,
    order_status: orderStatus !== 'all' ? orderStatus : undefined,
    payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
    plan_id: planId !== 'all' ? Number(planId) : undefined,
    page,
    page_size: 20,
  };

  const { data, isLoading, isError, refetch } = useAdminOrders(params);

  const hasFilters = debouncedQuery || orderStatus !== 'all' || paymentStatus !== 'all' || planId !== 'all';

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
    setOrderStatus('all');
    setPaymentStatus('all');
    setPlanId('all');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-3xl text-text-light mb-1">Orders</h1>
        <p className="text-text-muted">Manage all customer orders</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order ID or company..."
              className="pl-9 bg-bg-surface-light border-border-dark text-text-light placeholder:text-text-muted"
            />
          </div>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-bg-surface-light border-border-dark text-text-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-surface border-border-dark">
              {orderStatusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-text-light focus:bg-bg-surface-light">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-bg-surface-light border-border-dark text-text-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-surface border-border-dark">
              {paymentStatusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-text-light focus:bg-bg-surface-light">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {plans && plans.length > 0 && (
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="w-full sm:w-40 bg-bg-surface-light border-border-dark text-text-light">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-surface border-border-dark">
                <SelectItem value="all" className="text-text-light focus:bg-bg-surface-light">All Plans</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)} className="text-text-light focus:bg-bg-surface-light">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="text-text-muted hover:text-text-light">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-bg-surface rounded-2xl border border-border-dark overflow-hidden"
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 bg-bg-surface-light rounded" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16">
            <AlertCircle className="w-8 h-8 text-destructive mb-3" />
            <p className="text-text-light mb-2">Failed to load orders</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <AdminEmptyState
            icon={ShoppingCart}
            title="No orders found"
            description={hasFilters ? 'Try adjusting your filters.' : 'Orders will appear here once customers place them.'}
            action={hasFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-dark hover:bg-transparent">
                    <TableHead className="text-text-muted">Order</TableHead>
                    <TableHead className="text-text-muted">Company</TableHead>
                    <TableHead className="text-text-muted">Customer</TableHead>
                    <TableHead className="text-text-muted">Plan</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted">Payment</TableHead>
                    <TableHead className="text-text-muted text-right">Amount</TableHead>
                    <TableHead className="text-text-muted">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((order) => (
                    <TableRow
                      key={order.order_id}
                      onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                      className="border-border-dark cursor-pointer hover:bg-bg-surface-light transition-colors"
                    >
                      <TableCell className="text-text-light font-medium">#{order.order_id}</TableCell>
                      <TableCell className="text-text-light">{order.company_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-text-light text-sm">{order.user_full_name}</p>
                          <p className="text-text-muted text-xs">{order.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-light">
                        {order.plan_name}
                        {order.is_industry_specific && (
                          <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            SJP
                          </span>
                        )}
                      </TableCell>
                      <TableCell><AdminStatusBadge status={order.order_status} type="order" /></TableCell>
                      <TableCell><AdminStatusBadge status={order.payment_status} type="payment" /></TableCell>
                      <TableCell className="text-text-light text-right font-medium">{formatAmount(order.total_amount, order.currency)}</TableCell>
                      <TableCell className="text-text-muted text-sm">{formatDate(order.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border-dark">
              {data.items.map((order, index) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                  className="p-4 cursor-pointer hover:bg-bg-surface-light transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-text-light font-medium">#{order.order_id} &middot; {order.company_name}</p>
                      <p className="text-text-muted text-xs">{order.user_full_name}</p>
                    </div>
                    <p className="text-text-light font-medium">{formatAmount(order.total_amount, order.currency)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AdminStatusBadge status={order.order_status} type="order" />
                    <AdminStatusBadge status={order.payment_status} type="payment" />
                    {order.is_industry_specific && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                        SJP
                      </span>
                    )}
                    <span className="text-text-muted text-xs ml-auto">{formatDate(order.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="border-t border-border-dark p-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  Page {data.page} of {data.total_pages} ({data.total} orders)
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={`text-text-muted hover:text-text-light ${page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, data.total_pages - 4));
                      const p = start + i;
                      if (p > data.total_pages) return null;
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={p === page}
                            className={`cursor-pointer ${p === page ? 'bg-primary text-white' : 'text-text-muted hover:text-text-light'}`}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(data.total_pages, page + 1))}
                        className={`text-text-muted hover:text-text-light ${page >= data.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminOrders;
