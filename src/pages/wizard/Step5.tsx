import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '@/context/WizardContext';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api, ApiError } from '@/services/api';

const Step5 = () => {
  const navigate = useNavigate();
  const { selectedPlan, hasIndustryAddOn, getTotalPrice, orderId } = useWizard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  const totalPrice = getTotalPrice();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvv || !cardName) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (!orderId) {
      toast.error('Order ID not found. Please start over.');
      navigate('/app/step-1');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await api.createPaymentIntent(orderId);
      setPaymentIntentId(response.payment_intent_id);
      
      toast.success('Payment intent created! (In production, this would process via Stripe)');
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Payment successful!');
      navigate('/app/success');
    } catch (error) {
      console.error('Payment failed:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Complete Your Purchase
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Secure payment processing.
        </p>
      </div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-4">Order Summary</h3>
        <div className="space-y-3 py-4 border-b border-wizard-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-wizard-text font-medium">{selectedPlan?.name} Package</p>
              <p className="text-wizard-text-muted text-sm">Health & Safety Manual</p>
            </div>
            <p className="text-wizard-text font-medium">${selectedPlan?.price}.00 CAD</p>
          </div>
          {hasIndustryAddOn && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wizard-text font-medium">Industry-Specific Add-On</p>
                <p className="text-wizard-text-muted text-sm">Enhanced compliance documentation</p>
              </div>
              <p className="text-wizard-text font-medium">$100.00 CAD</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-4">
          <p className="text-wizard-text font-medium text-lg">Total Due</p>
          <p className="font-heading text-3xl text-wizard-text">
            ${totalPrice}.00 <span className="text-base text-wizard-text-muted">CAD</span>
          </p>
        </div>
      </motion.div>

      {/* Payment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-wizard-text" />
          <h3 className="font-heading text-xl text-wizard-text">Payment Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              Card Number
            </label>
            <Input
              type="text"
              placeholder="XXXX XXXX XXXX XXXX"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wizard-text mb-2">
                Expiry (MM/YY)
              </label>
              <Input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wizard-text mb-2">
                CVV
              </label>
              <Input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-wizard-text mb-2">
              Cardholder Name
            </label>
            <Input
              type="text"
              placeholder="Name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted"
            />
          </div>
        </div>

        <Button
          onClick={handlePay}
          disabled={isProcessing}
          size="lg"
          className="w-full mt-6 h-14 text-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ${totalPrice}.00 CAD</>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-wizard-text-muted text-sm">
          <Lock className="w-4 h-4" />
          Your payment is secured. We never store your card details.
        </div>
      </motion.div>

      <div className="flex justify-start pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/step-4')}
          className="px-8"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Step5;
