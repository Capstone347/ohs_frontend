import { Link } from 'react-router-dom';
import { mockOrders } from '@/data/mockData';
import { Download, Mail, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Orders = () => {
  const handleDownload = (orderId: string) => {
    toast.success(`Downloading OHS_Manual_${orderId}.docx...`);
  };

  const handleResendEmail = () => {
    toast.success('Email resent to your address.');
  };

  if (mockOrders.length === 0) {
    return (
      <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-wizard-bg flex items-center justify-center mx-auto mb-6 border border-wizard-border">
            <Package className="w-8 h-8 text-wizard-text-muted" />
          </div>
          <h1 className="font-heading text-3xl text-wizard-text mb-3">
            No Orders Yet
          </h1>
          <p className="text-wizard-text-muted mb-6">
            You haven't placed any orders yet. Start creating your first Health & Safety Manual today.
          </p>
          <Button asChild>
            <Link to="/app/step-1">
              Start Your First Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wizard-bg">
      {/* Header */}
      <header className="h-16 bg-white border-b border-wizard-border">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="font-heading text-xl text-wizard-text">
            OHS Remote
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/step-1">New Order</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-wizard-text mb-2">My Orders</h1>
          <p className="text-wizard-text-muted">
            View and manage your H&S manual orders.
          </p>
        </div>

        <div className="space-y-4">
          {mockOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-mono text-wizard-text font-medium">{order.id}</p>
                    <Badge
                      className={cn(
                        'text-xs font-medium',
                        order.status === 'delivered'
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-warning/10 text-warning hover:bg-warning/20'
                      )}
                    >
                      {order.status === 'delivered' ? 'Delivered' : 'Processing'}
                    </Badge>
                  </div>
                  <p className="text-wizard-text-muted text-sm mb-1">
                    {order.date} • {order.plan} Package
                  </p>
                  <p className="text-wizard-text-muted text-sm">
                    {order.province} • NAICS: {order.naics}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={order.status !== 'delivered'}
                    onClick={() => handleDownload(order.id)}
                    title={order.status !== 'delivered' ? 'Download available once delivered' : ''}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Email
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;
