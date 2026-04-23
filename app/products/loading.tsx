import { Loader2 } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters skeleton */}
        <aside className="lg:w-64 shrink-0">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-24" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-32" />
              ))}
            </div>
            <div className="h-6 bg-muted rounded w-24 mt-6" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
