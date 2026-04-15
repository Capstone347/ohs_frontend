import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';
import { usePendingReview } from '@/hooks/admin/usePendingReview';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(amount: string, currency: string) {
  return `$${parseFloat(amount).toFixed(2)} ${currency}`;
}

const AdminPendingReview = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePendingReview({ page, page_size: 20 });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-3xl text-text-light mb-1">Pending Review</h1>
        <p className="text-text-muted">Orders waiting for admin approval (oldest first)</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-bg-surface rounded-2xl border border-border-dark overflow-hidden"
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 bg-bg-surface-light rounded" />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading text-xl text-text-light mb-1">All caught up!</h3>
            <p className="text-sm text-text-muted">No orders are pending review right now.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-dark hover:bg-transparent">
                    <TableHead className="text-text-muted">Order</TableHead>
                    <TableHead className="text-text-muted">Company</TableHead>
                    <TableHead className="text-text-muted">Customer</TableHead>
                    <TableHead className="text-text-muted">Plan</TableHead>
                    <TableHead className="text-text-muted">Payment</TableHead>
                    <TableHead className="text-text-muted text-right">Amount</TableHead>
                    <TableHead className="text-text-muted">Submitted</TableHead>
                    <TableHead className="text-text-muted"></TableHead>
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
                      <TableCell><AdminStatusBadge status={order.payment_status} type="payment" /></TableCell>
                      <TableCell className="text-text-light text-right font-medium">{formatAmount(order.total_amount, order.currency)}</TableCell>
                      <TableCell className="text-text-muted text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <ArrowRight className="w-4 h-4 text-text-muted" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
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
                      <p className="text-text-muted text-xs">
                        {order.user_full_name} &middot; {order.plan_name}
                        {order.is_industry_specific && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                            SJP
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-text-light font-medium">{formatAmount(order.total_amount, order.currency)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={order.payment_status} type="payment" />
                    <span className="text-text-muted text-xs ml-auto">{formatDate(order.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {data.total_pages > 1 && (
              <div className="border-t border-border-dark p-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">Page {data.page} of {data.total_pages}</p>
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

export default AdminPendingReview;
