import { Link } from 'react-router-dom';
import { Package, ArrowRight, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyOrdersProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const EmptyOrders = ({ hasFilters, onClearFilters }: EmptyOrdersProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-wizard-bg flex items-center justify-center mx-auto mb-6 border border-wizard-border">
          <SearchX className="w-8 h-8 text-wizard-text-muted" />
        </div>
        <h2 className="font-heading text-2xl text-wizard-text mb-3">
          No orders match your filters
        </h2>
        <p className="text-wizard-text-muted mb-6">
          Try adjusting your search or filter criteria.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-wizard-bg flex items-center justify-center mx-auto mb-6 border border-wizard-border">
        <Package className="w-8 h-8 text-wizard-text-muted" />
      </div>
      <h2 className="font-heading text-2xl text-wizard-text mb-3">No Orders Yet</h2>
      <p className="text-wizard-text-muted mb-6">
        You haven't placed any orders yet. Start creating your first Health & Safety Manual today.
      </p>
      <Button asChild>
        <Link to="/app/step-1">
          Start Your First Order
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
};
