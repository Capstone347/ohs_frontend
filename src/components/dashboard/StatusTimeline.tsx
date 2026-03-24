import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimelineStep } from '@/services/api';
import { cn } from '@/lib/utils';

interface StatusTimelineProps {
  steps: TimelineStep[];
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return 'Pending';
  const date = new Date(ts);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const StatusTimeline = ({ steps }: StatusTimelineProps) => {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';

        return (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex gap-3"
          >
            {/* Indicator column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted && 'bg-primary text-white',
                  isCurrent && 'border-2 border-primary bg-white',
                  !isCompleted && !isCurrent && 'border-2 border-wizard-border bg-white'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-px flex-1 min-h-[24px]',
                    isCompleted ? 'bg-primary' : 'border-l border-dashed border-wizard-border'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-5', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  isCompleted || isCurrent ? 'text-wizard-text' : 'text-wizard-text-muted'
                )}
              >
                {step.step}
              </p>
              <p
                className={cn(
                  'text-xs mt-0.5',
                  step.timestamp ? 'text-wizard-text-muted' : 'text-wizard-text-muted/60'
                )}
              >
                {formatTimestamp(step.timestamp)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
