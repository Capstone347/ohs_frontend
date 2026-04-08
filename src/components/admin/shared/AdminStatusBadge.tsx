import { Badge } from '@/components/ui/badge';
import { orderStatusMap, paymentStatusMap, emailStatusMap, roleMap } from '@/lib/adminStatusMaps';

type StatusType = 'order' | 'payment' | 'email' | 'role';

const maps: Record<StatusType, Record<string, { label: string; variant: string }>> = {
  order: orderStatusMap,
  payment: paymentStatusMap,
  email: emailStatusMap,
  role: roleMap,
};

const variantClasses: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-text-muted/10 text-text-muted border-text-muted/20',
};

interface AdminStatusBadgeProps {
  status: string;
  type: StatusType;
}

export const AdminStatusBadge = ({ status, type }: AdminStatusBadgeProps) => {
  const map = maps[type];
  const entry = map[status] || { label: status, variant: 'secondary' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[entry.variant] || variantClasses.secondary}`}>
      {entry.label}
    </span>
  );
};
