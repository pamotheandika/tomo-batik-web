import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import ProductSection from "@/components/ProductSection";
import InfiniteScrollCatalog from "@/components/InfiniteScrollCatalog";
import HorizontalFilters from "@/components/HorizontalFilters";
import SortDropdown, { type SortOption } from "@/components/SortDropdown";
import type { FilterState } from "@/types/product";

/**
 * Batik Ready to Wear Brand Homepage
 * Dedicated page for Batik Ready to Wear products only
 */
const ReadyToWear = () => {
  const brandCategory = "ready-to-wear";

  // Filters state - category is locked to Ready to Wear
  const [filters, setFilters] = useState({
    category: [brandCategory], // Always locked to Ready to Wear
    subcategory: [] as string[],
    size: [] as string[],
    color: [] as string[],
    priceRange: [0, 3000000] as [number, number],
  });

  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Wrapper to ensure category is always locked to Ready to Wear
  const updateFilters = (newFilters: typeof filters) => {
    setFilters({
      ...newFilters,
      category: [brandCategory], // Always enforce Ready to Wear category
    });
  };

  const clearAllFilters = () => {
    setFilters({
      category: [brandCategory], // Keep Ready to Wear category
      subcategory: [],
      size: [],
      color: [],
      priceRange: [0, 3000000],
    });
  };

  // Convert to FilterState format for API - Reactive to filters changes
  const getBrandFilters = useCallback((additionalFilters: Partial<FilterState> = {}): Partial<FilterState> => {
    return {
      category: [brandCategory], // Always locked to Ready to Wear
      subcategory: filters.subcategory,
      size: filters.size,
      color: filters.color,
      priceRange: filters.priceRange as [number, number],
      ...additionalFilters,
    };
  }, [brandCategory, filters.subcategory, filters.size, filters.color, filters.priceRange[0], filters.priceRange[1]]);

  // Filters for Ready to Wear products - Reactive to filter changes
  const brandFilters: Partial<FilterState> = useMemo(() => getBrandFilters({
    sortBy,
  }), [getBrandFilters, sortBy]);

  // Best Seller filters - only Ready to Wear best sellers
  const bestSellerFilters: Partial<FilterState> = useMemo(() => getBrandFilters({
    isBestSeller: true,
    sortBy: "popular",
  }), [getBrandFilters]);

  // Newest filters - only Ready to Wear new products
  const newestFilters: Partial<FilterState> = useMemo(() => getBrandFilters({
    isNew: true,
    sortBy: "newest",
  }), [getBrandFilters]);

  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      <main>
        {/* Best Seller Products Section - Only Ready to Wear */}
        <ProductSection
          title="Best Seller Products"
          badge="Popular"
          filters={bestSellerFilters}
          limit={8}
          showViewAll={true}
          viewAllLink={`/catalog?category_id=${brandCategory}&is_best_seller=true`}
          className="bg-background"
        />

        {/* Latest Products Section - Only Ready to Wear */}
        <ProductSection
          title="Latest Products"
          badge="Latest"
          filters={newestFilters}
          limit={8}
          showViewAll={true}
          viewAllLink={`/catalog?category_id=${brandCategory}&is_new=true&sort_by=newest`}
          className="bg-gradient-to-b from-background to-secondary/20"
        />

        {/* Filters Section */}
        <section className="bg-background border-t border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-4">
              {/* Horizontal Filters - Category hidden as it's locked to Ready to Wear */}
              <HorizontalFilters 
                filters={filters} 
                setFilters={updateFilters}
                onReset={clearAllFilters}
                hideCategory={true}
              />
              
              {/* Sort Dropdown */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Filter by subcategory, size, color, and price
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog with Infinite Scroll - Only Ready to Wear Products */}
        <InfiniteScrollCatalog
          filters={brandFilters}
          limit={24}
          title="All Ready to Wear Products"
          className="bg-background"
        />
      </main>
      <Footer />
    </div>
  );
};

export default ReadyToWear;

