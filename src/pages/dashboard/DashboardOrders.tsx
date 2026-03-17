import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { OrderStatusBadge } from '@/components/dashboard/OrderStatusBadge';
import { EmptyOrders } from '@/components/dashboard/EmptyOrders';
import { OrdersTableSkeleton } from '@/components/dashboard/OrdersTableSkeleton';
import { useOrders } from '@/hooks/useOrders';
import { OrdersQueryParams } from '@/services/api';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'processing', label: 'Processing' },
  { value: 'review_pending', label: 'Review Pending' },
  { value: 'available', label: 'Available' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount: string, currency: string): string {
  return `$${parseFloat(amount).toFixed(2)} ${currency}`;
}

const DashboardOrders = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params: OrdersQueryParams = {
    page,
    page_size: 20,
    ...(debouncedQuery && { query: debouncedQuery }),
    ...(statusFilter !== 'all' && { order_status: statusFilter }),
  };

  const { data, isLoading, isError, refetch } = useOrders(params);

  const hasFilters = !!debouncedQuery || statusFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedQuery('');
    setStatusFilter('all');
    setPage(1);
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-heading text-2xl text-wizard-text mb-3">Failed to load orders</h2>
        <p className="text-wizard-text-muted mb-6">Something went wrong. Please try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">My Orders</h1>
        <p className="text-wizard-text-muted text-lg">View and manage your H&S manual orders.</p>
      </div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wizard-text-muted" />
          <Input
            placeholder="Search by order ID or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-12 w-full sm:w-48 bg-white border-wizard-border text-wizard-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : !data || data.items.length === 0 ? (
        <EmptyOrders hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : (
        <>
          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:block bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-wizard-border hover:bg-transparent">
                  <TableHead className="text-wizard-text-muted font-medium">Order #</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium">Company</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium">Plan</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium">Status</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium">Payment</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium">Date</TableHead>
                  <TableHead className="text-wizard-text-muted font-medium text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow
                    key={order.order_id}
                    onClick={() => navigate(`/dashboard/orders/${order.order_id}`)}
                    className="cursor-pointer border-wizard-border hover:bg-wizard-bg/50 transition-colors"
                  >
                    <TableCell className="font-mono text-wizard-text text-sm">
                      #{order.order_id}
                    </TableCell>
                    <TableCell className="text-wizard-text">
                      {order.company_name || '—'}
                    </TableCell>
                    <TableCell className="text-wizard-text">{order.plan_name}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.order_status} type="order" />
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.payment_status} type="payment" />
                    </TableCell>
                    <TableCell className="text-wizard-text-muted text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-wizard-text font-medium text-right">
                      {formatAmount(order.total_amount, order.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {data.items.map((order, index) => (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(`/dashboard/orders/${order.order_id}`)}
                className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-wizard-text font-medium text-sm">
                      #{order.order_id}
                    </span>
                    <OrderStatusBadge status={order.order_status} type="order" />
                  </div>
                  <span className="text-wizard-text font-medium text-sm">
                    {formatAmount(order.total_amount, order.currency)}
                  </span>
                </div>
                <p className="text-wizard-text-muted text-sm">
                  {order.company_name || '—'} &middot; {order.plan_name}
                </p>
                <p className="text-wizard-text-muted text-sm mt-1">
                  {formatDate(order.created_at)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={p === page}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                      className={
                        page >= data.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardOrders;
