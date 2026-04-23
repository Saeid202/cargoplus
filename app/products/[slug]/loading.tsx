import { Loader2 } from "lucide-react";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 bg-muted rounded w-32 mb-6" />
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-muted rounded-xl" />
          
          {/* Details skeleton */}
          <div className="flex flex-col">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-8 bg-muted rounded w-32 mb-6" />
            <div className="h-4 bg-muted rounded w-40 mb-6" />
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
            <div className="h-32 bg-muted rounded-lg mb-6" />
            <div className="h-12 bg-muted rounded-lg mt-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
