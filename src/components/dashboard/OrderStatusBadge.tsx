import { Badge } from '@/components/ui/badge';
import {
  orderStatusMap,
  paymentStatusMap,
  variantClasses,
  OrderStatus,
  PaymentStatus,
} from '@/lib/statusMaps';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
  type: 'order' | 'payment';
}

export const OrderStatusBadge = ({ status, type }: OrderStatusBadgeProps) => {
  const map = type === 'order' ? orderStatusMap : paymentStatusMap;
  const config = map[status as OrderStatus & PaymentStatus] || {
    label: status,
    variant: 'default',
  };

  return (
    <Badge
      className={cn(
        'text-xs font-medium',
        variantClasses[config.variant],
        `hover:${variantClasses[config.variant]}`
      )}
    >
      {config.label}
    </Badge>
  );
};
