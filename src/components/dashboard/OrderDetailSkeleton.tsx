import { Skeleton } from '@/components/ui/skeleton';

export const OrderDetailSkeleton = () => (
  <div className="space-y-8">
    {/* Breadcrumb skeleton */}
    <div className="flex gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Documents card */}
        <div className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-8">
          <Skeleton className="h-6 w-28 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-wizard-border shadow-lg shadow-black/5 p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-7 h-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
