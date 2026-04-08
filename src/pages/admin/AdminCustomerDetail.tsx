import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCustomerDetail } from '@/hooks/admin/useAdminCustomerDetail';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const AdminCustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const numericId = customerId ? parseInt(customerId, 10) : null;
  const { data: customer, isLoading, isError } = useAdminCustomerDetail(numericId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-bg-surface" />
        <Skeleton className="h-64 bg-bg-surface rounded-2xl" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <h2 className="font-heading text-xl text-text-light mb-2">Customer not found</h2>
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-1 text-text-muted hover:text-text-light mb-4 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        <h1 className="font-heading text-3xl text-text-light">{customer.full_name}</h1>
        <p className="text-text-muted mt-1">Customer #{customer.id}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-6"
      >
        <h2 className="font-heading text-lg text-text-light mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={User} label="Full Name" value={customer.full_name} />
          <InfoRow icon={Mail} label="Email" value={customer.email} />
          <InfoRow icon={Calendar} label="Joined" value={formatDate(customer.created_at)} />
          <InfoRow icon={Clock} label="Last Login" value={formatDate(customer.last_login)} />
          <InfoRow icon={ShoppingCart} label="Total Orders" value={String(customer.order_count)} />
        </div>
      </motion.div>
    </div>
  );
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-surface-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-light font-medium">{value}</p>
      </div>
    </div>
  );
}

export default AdminCustomerDetail;
