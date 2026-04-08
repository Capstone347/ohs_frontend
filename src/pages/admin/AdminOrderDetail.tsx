import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Send,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Save,
  Clock,
  User,
  Building2,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';
import { useAdminOrderDetail } from '@/hooks/admin/useAdminOrderDetail';
import {
  useApproveOrder,
  useUpdateOrderNotes,
  useResendEmail,
  useRegenerateDocument,
} from '@/hooks/admin/useAdminMutations';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(amount: string, currency: string) {
  return `$${parseFloat(amount).toFixed(2)} ${currency}`;
}

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const numericId = orderId ? parseInt(orderId, 10) : null;

  const { data: order, isLoading, isError } = useAdminOrderDetail(numericId);

  const approveOrder = useApproveOrder();
  const updateNotes = useUpdateOrderNotes();
  const resendEmail = useResendEmail();
  const regenerateDoc = useRegenerateDocument();

  const [approveNotes, setApproveNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [notesInitialized, setNotesInitialized] = useState(false);

  // Initialize notes from order data
  if (order && !notesInitialized) {
    setAdminNotes(order.admin_notes || '');
    setNotesInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-bg-surface" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 bg-bg-surface rounded-2xl" />
            <Skeleton className="h-48 bg-bg-surface rounded-2xl" />
          </div>
          <Skeleton className="h-80 bg-bg-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-10 h-10 text-destructive mb-4" />
        <h2 className="font-heading text-xl text-text-light mb-2">Order not found</h2>
        <p className="text-text-muted mb-4">This order may not exist or you don't have access.</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isReviewPending = order.order_status === 'review_pending';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-1 text-text-muted hover:text-text-light mb-4 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-text-light">Order #{order.order_id}</h1>
            <p className="text-text-muted mt-1">{order.company_name} &middot; {order.plan_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={order.order_status} type="order" />
            <AdminStatusBadge status={order.payment_status} type="payment" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-bg-surface rounded-2xl border border-border-dark p-6"
          >
            <h2 className="font-heading text-lg text-text-light mb-4">Order Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={User} label="Customer" value={order.user_full_name} sub={order.user_email} />
              <InfoRow icon={Building2} label="Company" value={order.company_name} />
              <InfoRow icon={MapPin} label="Jurisdiction" value={order.jurisdiction} />
              <InfoRow icon={CreditCard} label="Amount" value={formatAmount(order.total_amount, order.currency)} />
              <InfoRow icon={Clock} label="Created" value={formatDate(order.created_at)} />
              <InfoRow icon={Clock} label="Completed" value={formatDate(order.completed_at)} />
              {order.reviewed_at && (
                <InfoRow icon={CheckCircle2} label="Reviewed" value={formatDate(order.reviewed_at)} />
              )}
              {order.is_industry_specific && (
                <InfoRow icon={FileText} label="Industry" value="Industry-specific add-on" />
              )}
            </div>
          </motion.div>

          {/* Documents */}
          {order.documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-bg-surface rounded-2xl border border-border-dark p-6"
            >
              <h2 className="font-heading text-lg text-text-light mb-4">Documents</h2>
              <div className="space-y-3">
                {order.documents.map((doc) => (
                  <div key={doc.document_id} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-light">
                    <div>
                      <p className="text-sm text-text-light font-medium">Document #{doc.document_id}</p>
                      <p className="text-xs text-text-muted">
                        {doc.file_format.toUpperCase()} &middot; Generated {formatDate(doc.generated_at)} &middot; Downloaded {doc.downloaded_count}x
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        Expires {formatDate(doc.token_expires_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Email Logs */}
          {order.email_logs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-bg-surface rounded-2xl border border-border-dark p-6"
            >
              <h2 className="font-heading text-lg text-text-light mb-4">Email History</h2>
              <div className="space-y-3">
                {order.email_logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-light">
                    <div>
                      <p className="text-sm text-text-light">{log.subject}</p>
                      <p className="text-xs text-text-muted">To: {log.recipient_email} &middot; {formatDate(log.sent_at)}</p>
                      {log.failure_reason && <p className="text-xs text-destructive mt-1">{log.failure_reason}</p>}
                    </div>
                    <AdminStatusBadge status={log.status} type="email" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Approve Action */}
          {isReviewPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-bg-surface rounded-2xl border border-warning/30 p-6"
            >
              <h2 className="font-heading text-lg text-text-light mb-2">Approval Required</h2>
              <p className="text-sm text-text-muted mb-4">
                This order is waiting for admin review and approval.
              </p>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Optional approval notes..."
                className="w-full rounded-lg border border-border-dark bg-bg-surface-light px-3 py-2.5 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3 min-h-[80px] resize-none"
              />
              <ConfirmDialog
                trigger={
                  <Button className="w-full" size="lg" disabled={approveOrder.isPending}>
                    {approveOrder.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve Order</>
                    )}
                  </Button>
                }
                title="Approve Order"
                description="This will generate the document and send the delivery email to the customer. This action cannot be undone."
                confirmLabel="Approve"
                isLoading={approveOrder.isPending}
                onConfirm={() => approveOrder.mutate({ orderId: order.order_id, admin_notes: approveNotes || undefined })}
              />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-bg-surface rounded-2xl border border-border-dark p-6 sticky top-6"
          >
            <h2 className="font-heading text-lg text-text-light mb-4">Actions</h2>
            <div className="space-y-3">
              <ConfirmDialog
                trigger={
                  <Button variant="outline" className="w-full justify-start border-border-dark text-text-light hover:bg-bg-surface-light" disabled={!isPaid || resendEmail.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    Resend Delivery Email
                  </Button>
                }
                title="Resend Delivery Email"
                description="This will resend the delivery email with document download link to the customer."
                confirmLabel="Resend"
                isLoading={resendEmail.isPending}
                onConfirm={() => resendEmail.mutate(order.order_id)}
              />

              <ConfirmDialog
                trigger={
                  <Button variant="outline" className="w-full justify-start border-border-dark text-text-light hover:bg-bg-surface-light" disabled={!isPaid || regenerateDoc.isPending}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Document
                  </Button>
                }
                title="Regenerate Document"
                description="This will generate a fresh document using the current template. Use this after uploading an updated template."
                confirmLabel="Regenerate"
                isLoading={regenerateDoc.isPending}
                onConfirm={() => regenerateDoc.mutate(order.order_id)}
              />
            </div>
          </motion.div>

          {/* Admin Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-bg-surface rounded-2xl border border-border-dark p-6"
          >
            <h2 className="font-heading text-lg text-text-light mb-3">Admin Notes</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              className="w-full rounded-lg border border-border-dark bg-bg-surface-light px-3 py-2.5 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3 min-h-[100px] resize-none"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-border-dark text-text-light hover:bg-bg-surface-light"
              disabled={updateNotes.isPending || adminNotes === (order.admin_notes || '')}
              onClick={() => updateNotes.mutate({ orderId: order.order_id, admin_notes: adminNotes })}
            >
              {updateNotes.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Notes</>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-surface-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-light font-medium">{value}</p>
        {sub && <p className="text-xs text-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

export default AdminOrderDetail;
