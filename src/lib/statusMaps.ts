export type OrderStatus = 'draft' | 'processing' | 'review_pending' | 'available' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'destructive' | 'default';
}

export const orderStatusMap: Record<OrderStatus, StatusConfig> = {
  draft: { label: 'Draft', variant: 'default' },
  processing: { label: 'Processing', variant: 'warning' },
  review_pending: { label: 'Review Pending', variant: 'warning' },
  available: { label: 'Available', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const paymentStatusMap: Record<PaymentStatus, StatusConfig> = {
  pending: { label: 'Pending', variant: 'default' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'default' },
};

export const variantClasses: Record<string, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  default: 'bg-wizard-text-muted/10 text-wizard-text-muted',
};

export const orderStatusHelperText: Record<OrderStatus, string> = {
  draft: 'Your order has been created. Complete payment to proceed.',
  processing: 'Payment confirmed. Your documents are being generated.',
  review_pending: 'Your documents are under review.',
  available: 'Your documents are ready for download.',
  cancelled: 'This order has been cancelled.',
};

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'available' || status === 'cancelled';
}
