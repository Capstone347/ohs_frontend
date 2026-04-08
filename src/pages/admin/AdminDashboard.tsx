import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/admin/useDashboardStats';
import { usePendingReview } from '@/hooks/admin/usePendingReview';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#22c55e', '#6b7280'];

function formatCurrency(value: string) {
  return `$${parseFloat(value).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor?: string;
  onClick?: () => void;
  highlight?: boolean;
}

const StatsCard = ({ icon: Icon, label, value, iconColor = 'text-primary', onClick, highlight }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    onClick={onClick}
    className={`bg-bg-surface rounded-2xl border border-border-dark p-6 ${onClick ? 'cursor-pointer hover:border-border-dark/80 hover:shadow-lg transition-all' : ''} ${highlight ? 'ring-1 ring-warning/30' : ''}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-bg-surface-light flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {onClick && <ArrowRight className="w-4 h-4 text-text-muted" />}
    </div>
    <p className="text-sm text-text-muted mb-1">{label}</p>
    <p className="font-heading text-2xl text-text-light">{value}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();
  const { data: pendingData } = usePendingReview({ page: 1, page_size: 5 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 bg-bg-surface mb-2" />
          <Skeleton className="h-4 w-72 bg-bg-surface" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-bg-surface rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-bg-surface rounded-2xl" />
          <Skeleton className="h-80 bg-bg-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <h2 className="font-heading text-xl text-text-light mb-2">Failed to load dashboard</h2>
        <p className="text-text-muted mb-4">Could not fetch dashboard stats.</p>
        <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const statusChartData = Object.entries(stats.orders_by_status).map(([key, value]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
  }));

  const revenueChartData = Object.entries(stats.revenue_by_plan).map(([name, value]) => ({
    name,
    revenue: parseFloat(String(value)),
  }));

  const pendingOrders = pendingData?.items || [];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-heading text-3xl text-text-light mb-1">Dashboard</h1>
        <p className="text-text-muted">Overview of your operations</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.total_revenue)} iconColor="text-success" />
        <StatsCard icon={ShoppingCart} label="Total Orders" value={stats.total_orders} />
        <StatsCard
          icon={ClipboardCheck}
          label="Pending Review"
          value={stats.pending_review_count}
          iconColor={stats.pending_review_count > 0 ? 'text-warning' : 'text-success'}
          highlight={stats.pending_review_count > 0}
          onClick={() => navigate('/admin/pending-review')}
        />
        <StatsCard icon={TrendingUp} label="Plans Sold" value={Object.values(stats.orders_by_plan).reduce((a, b) => a + b, 0)} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Review Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-bg-surface rounded-2xl border border-border-dark p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-text-light">Pending Review</h2>
            {stats.pending_review_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/pending-review')}
                className="text-primary hover:text-primary/80"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-text-light font-medium">All caught up!</p>
              <p className="text-sm text-text-muted">No orders pending review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-light hover:bg-bg-surface-light/80 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-text-light font-medium truncate">
                      #{order.order_id} &middot; {order.company_name}
                    </p>
                    <p className="text-xs text-text-muted">{order.plan_name} &middot; {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={order.payment_status} type="payment" />
                    <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Orders by Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-bg-surface rounded-2xl border border-border-dark p-6"
        >
          <h2 className="font-heading text-lg text-text-light mb-4">Orders by Status</h2>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-12">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Revenue by Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-6"
      >
        <h2 className="font-heading text-lg text-text-light mb-4">Revenue by Plan</h2>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(value: number) => [`$${value.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-sm text-center py-12">No data available</p>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
