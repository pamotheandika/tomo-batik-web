import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductModal from "./ProductModal";
import ProductSkeleton from "./ProductSkeleton";
import { productService } from "@/services/productService";
import type { Product, FilterState } from "@/types/product";

interface ProductSectionProps {
  title: string;
  badge?: string;
  filters?: Partial<FilterState>;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
  noSectionWrapper?: boolean; // If true, don't wrap in section tag
}

/**
 * Reusable Product Section Component
 * Displays products in a responsive grid layout
 * Used for Best Seller and Newest Products sections
 */
const ProductSection = ({
  title,
  badge,
  filters = {},
  limit = 8,
  showViewAll = true,
  viewAllLink,
  className,
  noSectionWrapper = false,
}: ProductSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts(filters, 1, limit);
        setProducts(response.products);
      } catch (error) {
        console.error(`Failed to fetch ${title}:`, error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, limit, title]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const content = (
    <>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
        <div>
          {badge && (
            <Badge variant="outline" className="mb-2">
              {badge}
            </Badge>
          )}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
        {showViewAll && viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="group relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            style={{ animationDelay: `${index * 50}ms` }}
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

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );

  if (loading) {
    const loadingContent = (
      <>
        <div className="flex items-center justify-between mb-8">
          <div>
            {badge && (
              <Badge variant="outline" className="mb-2">
                {badge}
              </Badge>
            )}
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        </div>
        <ProductSkeleton count={4} gridView="comfortable" />
      </>
    );

    if (noSectionWrapper) {
      return <div className={className}>{loadingContent}</div>;
    }

    return (
      <section className={cn("py-12 md:py-16", className)}>
        <div className="container mx-auto px-4">{loadingContent}</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  if (noSectionWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">{content}</div>
    </section>
  );
};

export default ProductSection;

