import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Mail, X } from 'lucide-react';
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
import { useEmailLogs } from '@/hooks/admin/useEmailLogs';

const emailStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const AdminEmailLogs = () => {
  const navigate = useNavigate();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [debouncedOrderId, setDebouncedOrderId] = useState('');
  const [emailStatus, setEmailStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedOrderId(orderIdInput), 300);
    return () => clearTimeout(timer);
  }, [orderIdInput]);

  useEffect(() => { setPage(1); }, [debouncedOrderId, emailStatus]);

  const params = {
    order_id: debouncedOrderId ? Number(debouncedOrderId) : undefined,
    email_status: emailStatus !== 'all' ? emailStatus : undefined,
    page,
    page_size: 20,
  };

  const { data, isLoading } = useEmailLogs(params);
  const hasFilters = debouncedOrderId || emailStatus !== 'all';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-3xl text-text-light mb-1">Email Logs</h1>
        <p className="text-text-muted">Track all email delivery activity</p>
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
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Filter by order ID..."
              className="pl-9 bg-bg-surface-light border-border-dark text-text-light placeholder:text-text-muted"
            />
          </div>
          <Select value={emailStatus} onValueChange={setEmailStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-bg-surface-light border-border-dark text-text-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-bg-surface border-border-dark">
              {emailStatusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-text-light focus:bg-bg-surface-light">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={() => { setOrderIdInput(''); setDebouncedOrderId(''); setEmailStatus('all'); }} className="text-text-muted hover:text-text-light">
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
        ) : !data || data.items.length === 0 ? (
          <AdminEmptyState
            icon={Mail}
            title="No email logs found"
            description={hasFilters ? 'Try adjusting your filters.' : 'Email logs will appear here once emails are sent.'}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-dark hover:bg-transparent">
                    <TableHead className="text-text-muted">ID</TableHead>
                    <TableHead className="text-text-muted">Order</TableHead>
                    <TableHead className="text-text-muted">Recipient</TableHead>
                    <TableHead className="text-text-muted">Subject</TableHead>
                    <TableHead className="text-text-muted">Status</TableHead>
                    <TableHead className="text-text-muted">Sent At</TableHead>
                    <TableHead className="text-text-muted">Failure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((log) => (
                    <TableRow key={log.id} className="border-border-dark hover:bg-bg-surface-light transition-colors">
                      <TableCell className="text-text-muted text-sm">#{log.id}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/admin/orders/${log.order_id}`)}
                          className="text-primary hover:underline text-sm"
                        >
                          #{log.order_id}
                        </button>
                      </TableCell>
                      <TableCell className="text-text-light text-sm">{log.recipient_email}</TableCell>
                      <TableCell className="text-text-light text-sm max-w-xs truncate">{log.subject}</TableCell>
                      <TableCell><AdminStatusBadge status={log.status} type="email" /></TableCell>
                      <TableCell className="text-text-muted text-sm">{formatDate(log.sent_at)}</TableCell>
                      <TableCell className="text-destructive text-xs max-w-xs truncate">{log.failure_reason || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-border-dark">
              {data.items.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-text-light text-sm font-medium">{log.subject}</p>
                    <AdminStatusBadge status={log.status} type="email" />
                  </div>
                  <p className="text-text-muted text-xs">To: {log.recipient_email}</p>
                  <div className="flex justify-between mt-1">
                    <button onClick={() => navigate(`/admin/orders/${log.order_id}`)} className="text-primary text-xs hover:underline">
                      Order #{log.order_id}
                    </button>
                    <span className="text-text-muted text-xs">{formatDate(log.sent_at)}</span>
                  </div>
                  {log.failure_reason && <p className="text-destructive text-xs mt-1">{log.failure_reason}</p>}
                </motion.div>
              ))}
            </div>

            {data.total_pages > 1 && (
              <div className="border-t border-border-dark p-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">Page {data.page} of {data.total_pages} ({data.total} logs)</p>
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
                          <PaginationLink onClick={() => setPage(p)} isActive={p === page} className={`cursor-pointer ${p === page ? 'bg-primary text-white' : 'text-text-muted hover:text-text-light'}`}>
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

export default AdminEmailLogs;
