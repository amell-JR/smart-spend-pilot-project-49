
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Overview Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
      ))}
    </div>

    {/* Recent Expenses Skeleton */}
    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export const ExpenseListSkeleton = () => (
  <div className="space-y-6">
    {/* Filter Card Skeleton */}
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>

    {/* Expense Items Skeleton */}
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export const BudgetTrackerSkeleton = () => (
  <div className="space-y-6">
    {/* Overview Card Skeleton */}
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="text-right space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </Card>

    {/* Budget Items Skeleton */}
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);
