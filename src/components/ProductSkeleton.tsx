import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  count?: number;
  gridView?: "compact" | "comfortable";
}

const ProductSkeleton = ({ count = 6, gridView = "comfortable" }: ProductSkeletonProps) => {
  return (
    <div className={cn(
      "grid gap-5",
      gridView === "comfortable" 
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/50"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Image Skeleton */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
          </div>

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Category Tag */}
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />

            {/* Product Name */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>

            {/* Price */}
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />

            {/* Sizes */}
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="h-6 w-8 bg-muted rounded-md animate-pulse"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;

