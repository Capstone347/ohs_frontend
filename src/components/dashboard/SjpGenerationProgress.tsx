import { useState } from 'react';
import {
  Check,
  Circle,
  Loader2,
  XCircle,
  AlertCircle,
  ClipboardCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSjpStatus } from '@/hooks/useSjpStatus';
import { api, ApiError, SjpGenerationStatus } from '@/services/api';

interface SjpGenerationProgressProps {
  orderId: number;
}

const statusMessages: Record<SjpGenerationStatus, string> = {
  pending: 'Starting generation...',
  generating_toc: 'Analyzing your industry and generating procedure list...',
  generating_sjps: 'Generating safe job procedures...',
  completed: 'Generation complete! Your order is now under review.',
  failed: 'Generation encountered an error.',
};

export function SjpGenerationProgress({ orderId }: SjpGenerationProgressProps) {
  const { data: sjpStatus, isLoading, isError } = useSjpStatus(orderId);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await api.startSjpGeneration(orderId);
      toast.success('Generation restarted.');
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to restart generation.'
      );
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-wizard-text font-medium">Loading SJP status...</span>
        </div>
      </motion.div>
    );
  }

  if (isError || !sjpStatus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-warning animate-spin" />
          <span className="text-wizard-text font-medium">Preparing SJP generation...</span>
        </div>
        <p className="text-wizard-text-muted text-sm mt-2">
          This may take a moment. The page will update automatically.
        </p>
      </motion.div>
    );
  }

  const { status, progress, toc_entries, error_message } = sjpStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {status === 'completed' ? (
            <ClipboardCheck className="w-5 h-5 text-primary" />
          ) : status === 'failed' ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-heading text-xl text-wizard-text">
            Safe Job Procedures
          </h3>
          <p className="text-wizard-text-muted text-sm">
            {statusMessages[status]}
          </p>
        </div>
      </div>

      {/* Progress bar for generating_sjps phase */}
      {status === 'generating_sjps' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-wizard-text-muted">Progress</span>
            <span className="text-sm font-medium text-wizard-text">
              {progress.completed_sjps} of {progress.total_sjps} procedures
            </span>
          </div>
          <Progress value={progress.progress_ratio * 100} className="h-2" />
        </div>
      )}

      {/* Spinner for early phases */}
      {(status === 'pending' || status === 'generating_toc') && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* TOC entry checklist */}
      {toc_entries.length > 0 && status !== 'pending' && (
        <div className="space-y-2 mb-6">
          <AnimatePresence mode="popLayout">
            {toc_entries.map((entry, index) => (
              <motion.div
                key={entry.toc_entry_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-wizard-bg/50 transition-colors"
              >
                {entry.status === 'completed' ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : entry.status === 'generating' ? (
                  <Loader2 className="w-4 h-4 text-warning animate-spin flex-shrink-0" />
                ) : entry.status === 'failed' ? (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-wizard-text-muted/40 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    entry.status === 'completed'
                      ? 'text-wizard-text'
                      : entry.status === 'generating'
                        ? 'text-wizard-text font-medium'
                        : entry.status === 'failed'
                          ? 'text-destructive'
                          : 'text-wizard-text-muted'
                  }`}
                >
                  {entry.title}
                </span>
                {entry.status === 'failed' && entry.error_message && (
                  <span className="text-xs text-destructive ml-auto">
                    {entry.error_message}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed state */}
      {status === 'completed' && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-start gap-3">
          <ClipboardCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-wizard-text">
              Under Review
            </p>
            <p className="text-sm text-wizard-text-muted mt-1">
              Your safe job procedures have been generated and are now being reviewed by our team.
              You'll receive an email with download links once approved.
            </p>
          </div>
        </div>
      )}

      {/* Failed state */}
      {status === 'failed' && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-wizard-text">
                Generation Failed
              </p>
              {error_message && (
                <p className="text-sm text-wizard-text-muted mt-1">
                  {error_message}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="mt-4"
            size="sm"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Generation
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
