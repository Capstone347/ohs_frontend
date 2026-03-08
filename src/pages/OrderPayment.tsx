import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api, ApiError, OrderSummary } from '@/services/api';

const ACCEPTED_PAYMENT_METHODS = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Amex', icon: '💳' },
  { name: 'Apple Pay', icon: '🍎' },
  { name: 'Google Pay', icon: '📱' },
];

const OrderPayment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const numericOrderId = orderId ? parseInt(orderId, 10) : null;

  useEffect(() => {
    if (!numericOrderId || isNaN(numericOrderId)) {
      setLoadError('Invalid order ID.');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const summary = await api.getOrderSummary(numericOrderId);
        if (summary.payment_status === 'paid') {
          navigate(`/orders/${numericOrderId}/success`, { replace: true });
          return;
        }
        setOrderSummary(summary);
      } catch (error) {
        if (error instanceof ApiError) {
          setLoadError(error.message);
        } else {
          setLoadError('Failed to load order details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [numericOrderId, navigate]);

  const handlePay = async () => {
    if (!numericOrderId) return;

    setIsRedirecting(true);

    try {
      const { checkout_url } = await api.createCheckoutSession(numericOrderId);
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-wizard-text-muted mx-auto mb-4" />
          <p className="text-wizard-text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (loadError || !orderSummary) {
    return (
      <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-heading text-3xl text-wizard-text mb-3">
            Order Not Found
          </h1>
          <p className="text-wizard-text-muted mb-6">
            {loadError || 'We could not find this order. Please check the link or start a new order.'}
          </p>
          <Button asChild>
            <Link to="/app/step-1">Start a New Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl text-wizard-text mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-wizard-text-muted text-lg">
            Secure payment via Stripe for order #{orderSummary.order_id}.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8 mb-6"
        >
          <h3 className="font-heading text-xl text-wizard-text mb-4">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Order ID</span>
              <span className="text-wizard-text font-mono">
                #OHS-{orderSummary.order_id}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Plan</span>
              <span className="text-wizard-text">{orderSummary.plan.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Province</span>
              <span className="text-wizard-text">{orderSummary.province}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Email</span>
              <span className="text-wizard-text">{orderSummary.user_email}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-wizard-text-muted text-lg">Total Due</span>
              <span className="font-heading text-3xl text-wizard-text">
                ${orderSummary.plan.price}.00{' '}
                <span className="text-base text-wizard-text-muted">CAD</span>
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-wizard-text" />
            <h3 className="font-heading text-xl text-wizard-text">Payment</h3>
          </div>

          <p className="text-wizard-text-muted mb-6">
            You'll be redirected to Stripe's secure checkout to complete your payment.
            No card details are collected on this site.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {ACCEPTED_PAYMENT_METHODS.map((method) => (
              <span
                key={method.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-wizard-bg border border-wizard-border text-wizard-text-muted text-xs font-medium"
              >
                {method.icon} {method.name}
              </span>
            ))}
          </div>

          <Button
            onClick={handlePay}
            disabled={isRedirecting}
            size="lg"
            className="w-full h-14 text-lg"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>Pay ${orderSummary.plan.price}.00 CAD</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-wizard-text-muted text-sm">
            <Lock className="w-4 h-4" />
            <span>256-bit SSL encrypted</span>
            <span className="mx-1">•</span>
            <ShieldCheck className="w-4 h-4" />
            <span>Powered by Stripe</span>
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-wizard-text-muted hover:text-wizard-text transition-colors text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPayment;
