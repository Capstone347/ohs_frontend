import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWizard } from '@/context/WizardContext';
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api, ApiError } from '@/services/api';

type PaymentUiStatus =
    | 'processing'
    | 'succeeded'
    | 'requires_action'
    | 'requires_payment_method'
    | 'payment_failed'
    | 'canceled'
    | 'paid'
    | 'unpaid'
    | 'unknown';

const getPaymentTitle = (status: PaymentUiStatus) => {
  switch (status) {
    case 'processing':
      return 'Processing payment';
    case 'succeeded':
    case 'paid': // current app success
      return 'Payment confirmed';
    case 'requires_action':
      return 'Action required';
    case 'requires_payment_method':
    case 'payment_failed':
    case 'unpaid':
      return 'Payment failed — try again';
    case 'canceled':
      return 'Payment canceled';
    default:
      return 'Processing payment';
  }
};

const Success = () => {
  const navigate = useNavigate();
  const { selectedPlan, province, naicsCode, orderId, documentId, userEmail } = useWizard();
  const [isPolling, setIsPolling] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>('processing');
  const [isDownloading, setIsDownloading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      toast.error('Order not found. Please start over.');
      navigate('/app/step-1');
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const orderSummary = await api.getOrderSummary(orderId);

        const backendStatus = (orderSummary.payment_status ?? 'processing') as string;

        // Current mocked success condition
        if (backendStatus === 'paid') {
          setPaymentStatus('paid');
          setIsPolling(false);
          clearInterval(pollInterval);
          toast.success('Payment confirmed! Your document is ready.');
          return;
        }

        // Future Stripe-style statuses
        const stripeLikeStatuses = new Set([
          'processing',
          'succeeded',
          'requires_action',
          'requires_payment_method',
          'payment_failed',
          'canceled',
        ]);

        if (stripeLikeStatuses.has(backendStatus)) {
          setPaymentStatus(backendStatus);

          // Stop polling for terminal states
          if (
              ['succeeded', 'payment_failed', 'requires_payment_method', 'canceled'].includes(
                  backendStatus
              )
          ) {
            setIsPolling(false);
            clearInterval(pollInterval);
          }
        }

        if (attempts >= maxAttempts) {
          setIsPolling(false);
          clearInterval(pollInterval);
          toast.warning(
              'Payment verification taking longer than expected. Check your email.'
          );
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);

        if (attempts >= maxAttempts) {
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [orderId, navigate]);

  const handleDownload = async () => {
    if (!documentId) {
      toast.error('Document not found. Please contact support.');
      return;
    }

    if (paymentStatus !== 'paid') {
      toast.error('Payment must be confirmed before downloading.');
      return;
    }

    setIsDownloading(true);
    try {
      let token = accessToken;
      
      if (!token) {
        const docDetails = await api.getDocumentDetails(documentId);
        token = docDetails.access_token;
        setAccessToken(token);
      }

      const blob = await api.downloadFinalDocument(documentId, token);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ohs_manual_${orderId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download document. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const orderData = {
    id: orderId ? `#OHS-${orderId}` : '#OHS-PENDING',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    plan: selectedPlan?.name || 'Basic',
    province: province,
    naics: naicsCode || '—',
    email: userEmail || 'your-email@example.com',
    status: isPolling ? 'Processing' : paymentStatus === 'paid' ? 'Completed' : 'Processing',
  };

  return (
    <div className="min-h-screen bg-wizard-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-heading text-4xl text-wizard-text mb-3">
            {getPaymentTitle(isPolling ? 'processing' : (paymentStatus as PaymentUiStatus))}
          </h1>
          <p className="text-wizard-text-muted text-lg">
            Your editable Health & Safety Manual will be emailed to you shortly.
          </p>
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
              <span className="text-wizard-text font-mono">{orderData.id}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Date</span>
              <span className="text-wizard-text">{orderData.date}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Plan</span>
              <span className="text-wizard-text">{orderData.plan}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Province</span>
              <span className="text-wizard-text">{orderData.province}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">NAICS</span>
              <span className="text-wizard-text">{orderData.naics}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-wizard-border">
              <span className="text-wizard-text-muted">Email</span>
              <span className="text-wizard-text">{orderData.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-wizard-text-muted">Status</span>
              {isPolling ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {orderData.status}
                </span>
              ) : paymentStatus === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {orderData.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  {orderData.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading || paymentStatus !== 'paid'}
              className="flex-1"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Manual
                </>
              )}
            </Button>
            <Button asChild className="flex-1">
              <Link to="/app/orders">
                View My Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>

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

export { getPaymentTitle };
export default Success;
