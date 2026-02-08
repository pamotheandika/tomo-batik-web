import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Sparkles, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductModal from "./ProductModal";
import ProductSkeleton from "./ProductSkeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import type { Product, FilterState } from "@/types/product";

interface InfiniteScrollCatalogProps {
  filters?: Partial<FilterState>;
  limit?: number;
  className?: string;
  title?: string;
}

/**
 * Reusable Infinite Scroll Catalog Component
 * Loads products progressively when user scrolls
 * Maintains good performance and avoids blocking initial page render
 */
const InfiniteScrollCatalog = ({
  filters = {},
  limit = 24,
  className,
  title,
}: InfiniteScrollCatalogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useInfiniteProducts({
    filters,
    limit,
    enabled: true,
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  // Initial loading state
  if (loading && products.length === 0) {
    return (
      <div className={cn("py-12 md:py-16", className)}>
        {title && (
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}
        <div className="container mx-auto px-4">
          <ProductSkeleton count={6} gridView="comfortable" />
        </div>
      </div>
    );
  }

  // Error State
  if (error && products.length === 0) {
    return (
      <div className={cn("py-12 md:py-16", className)}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{error}</p>
            <Button onClick={refetch} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-12 md:py-16", className)} ref={containerRef}>
      {title && (
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card border border-border/50",
                  "transition-all duration-500 ease-out",
                  "hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/20",
                  "hover:-translate-y-1"
                )}
              >
                {/* Image Container */}
                <div
                  className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={cn(
                      "object-cover w-full h-full transition-transform duration-700 ease-out",
                      hoveredProduct === product.id && "scale-110"
                    )}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400";
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isSingleSize && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px]">
                        ✦ Unique
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-accent text-accent-foreground border-0 shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {product.isBestSeller && (
                      <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                        Best Seller
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div
                    className={cn(
                      "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
                      hoveredProduct === product.id
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    )}
                  >
                    <button className="p-2.5 bg-white rounded-full shadow-lg hover:bg-white/95 hover:scale-110 transition-all">
                      <Heart className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                      className="p-2.5 bg-white rounded-full shadow-lg hover:bg-white/95 hover:scale-110 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      <Eye className="h-4 w-4 text-foreground" />
                    </button>
                  </div>

                  {/* Quick Add Button */}
                  <div
                    className={cn(
                      "absolute bottom-4 left-4 right-4 transition-all duration-300",
                      hoveredProduct === product.id
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    )}
                  >
                    <Button
                      className="w-full bg-white text-foreground hover:bg-white/95 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Quick View
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  {/* Category Tag */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-accent">
                      {product.subcategory}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3
                    className="font-medium text-foreground leading-tight cursor-pointer hover:text-accent transition-colors line-clamp-2 text-sm"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">
                      Rp {product.price.toLocaleString()}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rp {product.discountPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <span className="text-sm text-muted-foreground">Loading more products...</span>
            </div>
          </div>
        )}

        {/* Observer Target for Infinite Scroll */}
        <div ref={observerTarget} className="h-4" />

        {/* End of Catalog Message */}
        {!hasMore && products.length > 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              You've reached the end of the catalog
            </p>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-sm">
              Try adjusting your filters or check back later for new products.
            </p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default InfiniteScrollCatalog;

