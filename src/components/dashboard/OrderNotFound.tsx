import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OrderNotFound = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h1 className="font-heading text-3xl text-wizard-text mb-3">Order Not Found</h1>
    <p className="text-wizard-text-muted mb-6">
      We couldn't find this order. It may have been removed or you may not have access.
    </p>
    <Button asChild variant="outline">
      <Link to="/dashboard/orders">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>
    </Button>
  </div>
);
