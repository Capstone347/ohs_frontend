import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api, OrderStatusResponse } from '@/services/api';
import { SjpGenerationProgress } from '@/components/dashboard/SjpGenerationProgress';

type PaymentState = 'polling' | 'paid' | 'failed' | 'error';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const numericOrderId = orderId ? parseInt(orderId, 10) : null;

  const [paymentState, setPaymentState] = useState<PaymentState>('polling');
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);

  useEffect(() => {
    if (!numericOrderId || isNaN(numericOrderId)) {
      setPaymentState('error');
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const status = await api.getOrderStatus(numericOrderId);
        setOrderStatus(status);

        if (status.payment_status === 'paid') {
          setPaymentState('paid');
          clearInterval(pollInterval);
          toast.success('Payment confirmed!');
        } else if (status.payment_status === 'failed') {
          setPaymentState('failed');
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          toast.warning('Payment verification taking longer than expected. Check your email.');
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPaymentState('error');
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [numericOrderId]);

  if (paymentState === 'error' && !orderStatus) {
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
            We could not find this order. Please check the link or start a new order.
          </p>
          <Button asChild>
            <Link to="/app/step-1">Start a New Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  const orderDate = orderStatus
    ? new Date(orderStatus.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const isIndustrySpecific = orderStatus?.is_industry_specific ?? false;

  return (
    <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {paymentState === 'failed' ? (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="font-heading text-4xl text-wizard-text mb-3">
                Payment Failed
              </h1>
              <p className="text-wizard-text-muted text-lg">
                Something went wrong with your payment. Please try again.
              </p>
            </>
          ) : paymentState === 'paid' ? (
            <>
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="font-heading text-4xl text-wizard-text mb-3">
                Payment Confirmed!
              </h1>
              <p className="text-wizard-text-muted text-lg">
                {isIndustrySpecific
                  ? 'Your documents are being generated. We\'ll email you once they\'re ready.'
                  : 'Your editable Health & Safety Manual will be emailed to you shortly.'}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-warning animate-spin" />
              </div>
              <h1 className="font-heading text-4xl text-wizard-text mb-3">
                Processing Payment...
              </h1>
              <p className="text-wizard-text-muted text-lg">
                We're confirming your payment. This usually takes a few seconds.
              </p>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
        >
          <h3 className="font-heading text-xl text-wizard-text mb-6">Order Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Order ID</span>
              <span className="text-wizard-text font-mono">
                #OHS-{numericOrderId}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Date</span>
              <span className="text-wizard-text">{orderDate}</span>
            </div>
            {orderStatus && (
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted">Plan</span>
                <span className="text-wizard-text">{orderStatus.plan_name}</span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-wizard-text-muted">Status</span>
              {paymentState === 'polling' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing
                </span>
              ) : paymentState === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                  <XCircle className="w-3 h-3" />
                  Failed
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {paymentState === 'failed' ? (
              <Button asChild className="flex-1">
                <Link to={`/orders/${numericOrderId}/payment`}>
                  Try Again
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1">
                  <Link to={`/dashboard/orders/${numericOrderId}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Order Details
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/dashboard/orders">
                    View My Orders
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {paymentState === 'paid' && isIndustrySpecific && numericOrderId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <SjpGenerationProgress orderId={numericOrderId} />
          </motion.div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-wizard-text-muted hover:text-wizard-text transition-colors text-sm"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
