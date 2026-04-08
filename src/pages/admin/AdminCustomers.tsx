import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminEmptyState } from '@/components/admin/shared/AdminEmptyState';
import { useAdminCustomers } from '@/hooks/admin/useAdminCustomers';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const AdminCustomers = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [debouncedQuery]);

  const { data, isLoading } = useAdminCustomers({
    query: debouncedQuery || undefined,
    page,
    page_size: 20,
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-3xl text-text-light mb-1">Customers</h1>
        <p className="text-text-muted">View registered customers</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-4"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 bg-bg-surface-light border-border-dark text-text-light placeholder:text-text-muted"
            />
          </div>
          {debouncedQuery && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchInput(''); setDebouncedQuery(''); }} className="text-text-muted hover:text-text-light">
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
            icon={Users}
            title="No customers found"
            description={debouncedQuery ? 'Try adjusting your search.' : 'Customers will appear here after they register.'}
          />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border-dark hover:bg-transparent">
                    <TableHead className="text-text-muted">Name</TableHead>
                    <TableHead className="text-text-muted">Email</TableHead>
                    <TableHead className="text-text-muted">Joined</TableHead>
                    <TableHead className="text-text-muted">Last Login</TableHead>
                    <TableHead className="text-text-muted text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((customer) => (
                    <TableRow
                      key={customer.id}
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="border-border-dark cursor-pointer hover:bg-bg-surface-light transition-colors"
                    >
                      <TableCell className="text-text-light font-medium">{customer.full_name}</TableCell>
                      <TableCell className="text-text-muted">{customer.email}</TableCell>
                      <TableCell className="text-text-muted text-sm">{formatDate(customer.created_at)}</TableCell>
                      <TableCell className="text-text-muted text-sm">{formatDate(customer.last_login)}</TableCell>
                      <TableCell className="text-text-light text-right font-medium">{customer.order_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-border-dark">
              {data.items.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  className="p-4 cursor-pointer hover:bg-bg-surface-light transition-colors"
                >
                  <p className="text-text-light font-medium">{customer.full_name}</p>
                  <p className="text-text-muted text-sm">{customer.email}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-text-muted text-xs">Joined {formatDate(customer.created_at)}</span>
                    <span className="text-text-light text-xs font-medium">{customer.order_count} orders</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {data.total_pages > 1 && (
              <div className="border-t border-border-dark p-4 flex items-center justify-between">
                <p className="text-sm text-text-muted">Page {data.page} of {data.total_pages} ({data.total} customers)</p>
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

export default AdminCustomers;
