import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '@/context/WizardContext';
import { getTOCForPlan } from '@/data/mockData';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { api, ApiError } from '@/services/api';
import { toast } from 'sonner';
import { provinceNameToCode } from '@/lib/provinceMapping';

const Step4 = () => {
  const navigate = useNavigate();
  const {
    selectedPlan,
    hasIndustryAddOn,
    disclaimerAccepted,
    signatureName,
    signatureDate,
    userEmail,
    orderId,
    province,
    setDisclaimerAccepted,
    setSignatureName,
  } = useWizard();

  const [isAccepting, setIsAccepting] = useState(false);
  const tocItems = selectedPlan ? getTOCForPlan(selectedPlan.id, hasIndustryAddOn) : [];
  const canContinue = disclaimerAccepted && signatureName.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue) {
      toast.error('Please accept the terms and provide your signature');
      return;
    }

    if (!orderId) {
      toast.error('Order not found. Please start over.');
      navigate('/app/step-1');
      return;
    }

    if (!province) {
      toast.error('Province not found. Please complete previous steps.');
      navigate('/app/step-1');
      return;
    }

    setIsAccepting(true);
    try {
      const jurisdictionCode = provinceNameToCode(province);
      
      await api.acceptLegalTerms(orderId, {
        jurisdiction: jurisdictionCode,
        content: `I, ${signatureName}, acknowledge that I have read and understood the terms and conditions for the ${selectedPlan?.name} plan.`,
        version: 1,
      });

      toast.success('Terms accepted!');
      navigate('/app/step-5');
    } catch (error) {
      console.error('Failed to accept legal terms:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to accept terms. Please try again.');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-wizard-text mb-2">
          Preview & Approve
        </h1>
        <p className="text-wizard-text-muted text-lg">
          Review your Table of Contents and accept the terms.
        </p>
      </div>

      {/* TOC Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <h3 className="font-heading text-xl text-wizard-text mb-6">
          Your Table of Contents
        </h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tocItems.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-3 text-wizard-text text-sm"
            >
              <span className="w-6 h-6 rounded-full bg-wizard-bg flex items-center justify-center text-xs font-medium text-wizard-text-muted flex-shrink-0">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Legal Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-error-light rounded-2xl border-l-4 border-error p-6"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-dark mb-3">Legal Disclaimer</h4>
            <p className="text-text-dark text-sm leading-relaxed mb-4">
              The company takes full and sole responsibility for ensuring the final adopted H&S Manual meets all specific operational, site-specific, and legislative requirements applicable to its industry (NAICS code) and jurisdiction (Province of Ontario).
            </p>
            <p className="text-text-dark text-sm leading-relaxed">
              The OHS Advisor (provider of this template) shall <strong>not be held accountable</strong> for any fines, penalties, damages, accidents, injuries, or losses resulting from the company's subsequent use, interpretation, failure to update, or implementation (or lack thereof) of the final H&S Manual. The company hereby releases and waives any claims against the OHS Advisor related to the content or structure provided.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Acknowledgment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="flex items-start gap-3 mb-6">
          <Checkbox
            id="disclaimer"
            checked={disclaimerAccepted}
            onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
            className="mt-1"
          />
          <label
            htmlFor="disclaimer"
            className="text-wizard-text text-sm leading-relaxed cursor-pointer"
          >
            I confirm that I have read, understand, and fully accept the terms of the Legal Disclaimer, including the waiver of liability against the OHS Advisor.
          </label>
        </div>

        <div className="border-t border-wizard-border pt-6">
          <h4 className="font-medium text-wizard-text mb-4">Official Signature</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-wizard-text mb-2">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="h-12 bg-white border-wizard-border text-wizard-text placeholder:text-wizard-text-muted font-heading text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wizard-text mb-2">
                Date
              </label>
              <Input
                type="text"
                value={signatureDate}
                disabled
                className="h-12 bg-wizard-bg border-wizard-border text-wizard-text-muted"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/step-3')}
          className="px-8"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue || isAccepting}
          size="lg"
          className="px-8"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Accepting Terms...
            </>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step4;
