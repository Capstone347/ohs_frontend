import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Download,
  Eye,
  Copy,
  RefreshCw,
  CreditCard,
  Loader2,
  ChevronDown,
  ChevronUp,
  MailIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/dashboard/OrderStatusBadge";
import { StatusTimeline } from "@/components/dashboard/StatusTimeline";
import { OrderDetailSkeleton } from "@/components/dashboard/OrderDetailSkeleton";
import { OrderNotFound } from "@/components/dashboard/OrderNotFound";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { downloadDocument } from "@/lib/downloadDocument";
import { orderStatusHelperText, OrderStatus } from "@/lib/statusMaps";
import { api, ApiError } from "@/services/api";

const API_BASE_URL = "http://localhost:8000/api/v1";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: string, currency: string): string {
  return `$${parseFloat(amount).toFixed(2)} ${currency}`;
}

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const numericId = orderId ? parseInt(orderId, 10) : null;
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useOrderDetail(numericId);

  const [naicsExpanded, setNaicsExpanded] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) return <OrderDetailSkeleton />;
  if (isError || !order) return <OrderNotFound />;

  const naicsCodes = order.naics_codes || order.company?.naics_codes || [];
  const showNaicsExpand = naicsCodes.length > 2;
  const displayedNaics = naicsExpanded ? naicsCodes : naicsCodes.slice(0, 2);

  const needsPayment =
    order.payment_status === "failed" ||
    (order.order_status === "draft" && order.payment_status === "pending");

  const handlePayment = async () => {
    setIsPaymentLoading(true);
    try {
      const session = await api.createCheckoutSession(order.order_id);
      window.location.href = session.checkout_url;
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to start payment. Please try again.");
      }
      setIsPaymentLoading(false);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(String(order.order_id));
    toast.success("Order reference copied to clipboard");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["order", numericId] });
    setIsRefreshing(false);
  };

  const handleDownload = async (doc: (typeof order.documents)[0]) => {
    const isExpired = new Date(doc.token_expires_at) < new Date();
    if (isExpired) {
      toast.error("Download link has expired.");
      return;
    }
    try {
      await downloadDocument(
        doc.document_id,
        doc.access_token,
        `ohs_manual_${order.order_id}.${doc.file_format}`,
      );
    } catch {
      // Error already toasted in downloadDocument
    }
  };

  const handlePreview = (doc: (typeof order.documents)[0]) => {
    window.open(
      `${API_BASE_URL}/documents/${doc.document_id}/preview`,
      "_blank",
    );
  };

  const helperText =
    orderStatusHelperText[order.order_status as OrderStatus] || "";

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Order #{order.order_id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <h1 className="font-heading text-xl text-wizard-text">
                Order #{order.order_id}
              </h1>
              <OrderStatusBadge status={order.order_status} type="order" />
            </div>

            <div className="space-y-0">
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted text-sm">Plan</span>
                <span className="text-wizard-text font-medium">
                  {order.plan_name}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted text-sm">Company</span>
                <span className="text-wizard-text font-medium">
                  {order.company?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted text-sm">Province</span>
                <span className="text-wizard-text font-medium">
                  {order.company?.province || order.jurisdiction}
                </span>
              </div>
              {order.company?.business_description &&
                order.company.business_description.trim() !== "" && (
                  <div className="py-3 border-b border-wizard-border">
                    <span className="block text-wizard-text-muted text-sm mb-1">
                      Business Description
                    </span>
                    <p className="text-wizard-text font-medium text-right whitespace-pre-wrap">
                      {order.company.business_description}
                    </p>
                  </div>
                )}
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted text-sm">Created</span>
                <span className="text-wizard-text font-medium">
                  {formatDate(order.created_at)}
                </span>
              </div>
              {naicsCodes.length > 0 && (
                <div className="flex justify-between py-3 border-b border-wizard-border">
                  <span className="text-wizard-text-muted text-sm">
                    NAICS Codes
                  </span>
                  <div className="text-right">
                    <span className="text-wizard-text font-medium">
                      {displayedNaics.join(", ")}
                    </span>
                    {showNaicsExpand && (
                      <button
                        onClick={() => setNaicsExpanded(!naicsExpanded)}
                        className="ml-2 text-primary text-sm hover:underline inline-flex items-center gap-0.5"
                      >
                        {naicsExpanded ? (
                          <>
                            Show less <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            +{naicsCodes.length - 2} more{" "}
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-wizard-border">
                <span className="text-wizard-text-muted text-sm">Payment</span>
                <OrderStatusBadge
                  status={order.payment_status}
                  type="payment"
                />
              </div>
              <div className="flex justify-between py-3">
                <span className="text-wizard-text-muted text-sm">Total</span>
                <span className="font-heading text-2xl text-wizard-text">
                  {formatAmount(order.total_amount, order.currency)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-wizard-border">
              {needsPayment && (
                <Button onClick={handlePayment} disabled={isPaymentLoading}>
                  {isPaymentLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {order.payment_status === "failed"
                    ? "Retry Payment"
                    : "Pay Now"}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyOrderId}>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy Reference
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`mailto:support@ohsremote.com?subject=Order%20${order.order_id}`}
                >
                  <MailIcon className="w-4 h-4 mr-1.5" />
                  Contact Support
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8"
          >
            <h2 className="font-heading text-xl text-wizard-text mb-6">
              Documents
            </h2>

            {order.documents.length === 0 ? (
              <p className="text-wizard-text-muted text-sm">
                Documents will appear here once your order is processed.
              </p>
            ) : (
              <div className="space-y-3">
                {order.documents.map((doc) => {
                  const isExpired = new Date(doc.token_expires_at) < new Date();
                  return (
                    <div
                      key={doc.document_id}
                      className="flex items-center justify-between p-4 rounded-lg border border-wizard-border bg-wizard-bg/30"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-wizard-text text-sm font-medium">
                            OHS Manual — {doc.file_format.toUpperCase()}
                          </p>
                          <p className="text-wizard-text-muted text-xs">
                            Generated {formatDate(doc.generated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <Badge
                            variant="outline"
                            className="text-xs text-wizard-text-muted border-wizard-border"
                          >
                            Link Expired
                          </Badge>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(doc)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-6 sticky top-24"
          >
            <h3 className="font-heading text-lg text-wizard-text mb-6">
              Order Progress
            </h3>

            <StatusTimeline steps={order.timeline} />

            <div className="mt-6 pt-4 border-t border-wizard-border space-y-3">
              {helperText && (
                <p className="text-wizard-text-muted text-sm">{helperText}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Status
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
