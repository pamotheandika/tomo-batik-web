import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductModal from "./ProductModal";
import ProductSkeleton from "./ProductSkeleton";
import { useProducts } from "@/hooks/useProducts";
import type { Product, FilterState } from "@/types/product";

// All available sizes in the system
const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "Custom"];

interface ProductGridProps {
  filters: {
    category: string[];
    subcategory: string[];
    size: string[];
    color: string[];
    priceRange: number[];
  };
  gridView?: "compact" | "comfortable";
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
}

const ProductGrid = ({ filters, gridView = "comfortable", sortBy = "newest" }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const previousFiltersRef = useRef<string>('');

  // Use the products hook
  const { 
    products, 
    loading, 
    error, 
    totalProducts,
    fetchProducts, 
    refetch 
  } = useProducts({ autoFetch: false });

  // Preserve scroll position
  const preserveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.scrollY || window.pageYOffset;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollPositionRef.current > 0) {
      // Use requestAnimationFrame for smooth restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
      });
    }
  }, []);

  // Fetch products when filters or sortBy change
  useEffect(() => {
    const apiFilters: Partial<FilterState> = {
      category: filters.category,
      subcategory: filters.subcategory,
      size: filters.size,
      color: filters.color,
      priceRange: filters.priceRange as [number, number],
      sortBy,
    };
    
    // Create a unique key for current filters
    const filtersKey = JSON.stringify(apiFilters);
    
    // Only preserve scroll if filters actually changed
    if (previousFiltersRef.current && previousFiltersRef.current !== filtersKey) {
      preserveScrollPosition();
    }
    
    previousFiltersRef.current = filtersKey;
    
    // Start transition if we have existing products
    if (displayProducts.length > 0) {
      setIsTransitioning(true);
    }
    
    fetchProducts(apiFilters);
  }, [filters, sortBy, fetchProducts, preserveScrollPosition, displayProducts.length]);

  // Handle smooth transition when products change
  useEffect(() => {
    // First load - no transition needed
    if (displayProducts.length === 0 && products.length > 0 && !loading) {
      setDisplayProducts(products);
      return;
    }

    // Products changed - smooth transition
    if (!loading && products.length > 0) {
      const productsChanged = 
        products.length !== displayProducts.length || 
        products.some((p, i) => p.id !== displayProducts[i]?.id);
      
      if (productsChanged) {
        // Fade out current products
        setIsTransitioning(true);
        
        // After fade out, update products and fade in
        const timer = setTimeout(() => {
          setDisplayProducts(products);
          setIsTransitioning(false);
          
          // Restore scroll position after transition completes
          setTimeout(() => {
            restoreScrollPosition();
          }, 150);
        }, 200);
        
        return () => clearTimeout(timer);
      }
    } else if (!loading && products.length === 0) {
      // Empty state - no transition needed
      setDisplayProducts([]);
      setIsTransitioning(false);
    }
  }, [products, loading, displayProducts, restoreScrollPosition]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  // Initial loading state (first load)
  if (loading && displayProducts.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>
        <ProductSkeleton count={6} gridView={gridView} />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
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
    );
  }

  return (
    <div ref={gridRef} className="relative">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className={cn(
          "transition-opacity duration-300",
          isTransitioning && "opacity-80"
        )}>
          <h2 className="text-xl font-semibold tracking-tight">
            {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Showing all available items
          </p>
        </div>
      </div>

      {/* Loading Overlay - Soft loading indicator */}
      {loading && displayProducts.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-background/30 z-20 rounded-2xl flex items-center justify-center pointer-events-none animate-in fade-in-0 duration-200">
          <div className="flex flex-col items-center gap-3 bg-background px-6 py-4 rounded-xl shadow-xl border border-border/50">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-foreground font-medium">Updating products...</span>
          </div>
        </div>
      )}

      {/* Product Grid with smooth transitions */}
      <div className={cn(
        "grid gap-5 relative min-h-[400px] transition-opacity duration-300",
        gridView === "comfortable" 
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
          : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
        isTransitioning && displayProducts.length > 0 && "opacity-75"
      )}>
        {/* Display products */}
        {displayProducts.map((product, index) => (
          <div
            key={`${product.id}-${isTransitioning}`}
            className={cn(
              "group relative transition-all duration-500 ease-out",
              !isTransitioning && "animate-fade-in-up"
            )}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            style={{ 
              animationDelay: !isTransitioning ? `${Math.min(index * 30, 300)}ms` : '0ms'
            }}
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
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400";
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
                <div className={cn(
                  "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
                  hoveredProduct === product.id 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 translate-x-4"
                )}>
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
                <div className={cn(
                  "absolute bottom-4 left-4 right-4 transition-all duration-300",
                  hoveredProduct === product.id 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                )}>
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
              <div className="p-4 space-y-3">
                {/* Category Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-medium text-accent">
                    {product.subcategory}
                  </span>
                </div>

                {/* Product Name */}
                <h3 
                  className="font-medium text-foreground leading-tight cursor-pointer hover:text-accent transition-colors line-clamp-2"
                  onClick={() => handleProductClick(product)}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    Rp {product.price.toLocaleString()}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      Rp {product.discountPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Sizes - Different display for single size products */}
                {product.isSingleSize ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2.5 py-1 rounded-md font-semibold bg-accent/15 text-accent border border-accent/20">
                      Size {product.sizes[0]}
                    </span>
                    {product.motif && (
                      <span className="text-[10px] text-muted-foreground">
                        • {product.motif}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {/* Use allSizes to show all possible sizes, check availability against sizes */}
                    {(product.allSizes || ALL_SIZES).map((size) => {
                      const isAvailable = product.sizes.includes(size);
                      return (
                        <span
                          key={size}
                          className={cn(
                            "text-[10px] px-2 py-1 rounded-md font-medium transition-colors",
                            isAvailable
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted/30 text-muted-foreground/30 line-through"
                          )}
                        >
                          {size}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayProducts.length === 0 && !loading && !isTransitioning && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your filters or search criteria to find what you're looking for.
          </p>
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default ProductGrid;
