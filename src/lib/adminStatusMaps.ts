export const orderStatusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'warning' },
  review_pending: { label: 'Review Pending', variant: 'warning' },
  available: { label: 'Available', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const paymentStatusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'warning' },
};

export const emailStatusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  sent: { label: 'Sent', variant: 'warning' },
  delivered: { label: 'Delivered', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export const roleMap: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary' }> = {
  owner: { label: 'Owner', variant: 'default' },
  manager: { label: 'Manager', variant: 'warning' },
  support: { label: 'Support', variant: 'secondary' },
};
