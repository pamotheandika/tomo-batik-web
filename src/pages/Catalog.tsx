import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import HorizontalFilters from "@/components/HorizontalFilters";
import ProductGrid from "@/components/ProductGrid";
import SortDropdown, { type SortOption } from "@/components/SortDropdown";
import { Button } from "@/components/ui/button";
import { Grid3X3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL parameters to get initial filters
  const getInitialFilters = () => {
    const categoryId = searchParams.get("category_id");
    const subcategoryId = searchParams.get("subcategory_id");
    const sizes = searchParams.get("sizes");
    const colors = searchParams.get("colors");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");

    return {
      category: categoryId ? categoryId.split(",") : [],
      subcategory: subcategoryId ? subcategoryId.split(",") : [],
      size: sizes ? sizes.split(",") : [],
      color: colors ? colors.split(",") : [],
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 3000000,
      ] as [number, number],
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);
  const [gridView, setGridView] = useState<"compact" | "comfortable">("comfortable");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Update filters when URL changes
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [searchParams]);

  // Update URL when filters change (optional - for shareable URLs)
  const updateFiltersAndUrl = (newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Update URL parameters
    const params = new URLSearchParams();
    
    if (newFilters.category.length > 0) {
      params.set("category_id", newFilters.category.join(","));
    }
    if (newFilters.subcategory.length > 0) {
      params.set("subcategory_id", newFilters.subcategory.join(","));
    }
    if (newFilters.size.length > 0) {
      params.set("sizes", newFilters.size.join(","));
    }
    if (newFilters.color.length > 0) {
      params.set("colors", newFilters.color.join(","));
    }
    if (newFilters.priceRange[0] > 0) {
      params.set("min_price", newFilters.priceRange[0].toString());
    }
    if (newFilters.priceRange[1] < 3000000) {
      params.set("max_price", newFilters.priceRange[1].toString());
    }
    
    setSearchParams(params, { replace: true });
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      subcategory: [],
      size: [],
      color: [],
      priceRange: [0, 3000000],
    });
    setSearchParams({}, { replace: true });
  };

  const activeFiltersCount = 
    filters.category.length + 
    filters.subcategory.length + 
    filters.size.length + 
    filters.color.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000 ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <PromoBar />
      <Header />
      
      {/* Hero Section - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-6 md:py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-accent/10 text-accent rounded-full">
                  Koleksi Kami
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Discover Authentic Batik
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Explore our curated collection of handcrafted batik pieces.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Horizontal Filters */}
        <div className="mb-6">
          <HorizontalFilters 
            filters={filters} 
            setFilters={updateFiltersAndUrl}
            onReset={clearAllFilters}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {activeFiltersCount > 0 ? (
                <span className="px-2 py-1 bg-foreground/10 text-foreground rounded-md font-medium">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
                </span>
              ) : (
                <span>All products</span>
              )}
            </div>
            
            {/* Sort Dropdown */}
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setGridView("comfortable")}
              className={cn(
                "p-2 rounded-md transition-all",
                gridView === "comfortable" 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Comfortable view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGridView("compact")}
              className={cn(
                "p-2 rounded-md transition-all",
                gridView === "compact" 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Compact view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="w-full">
          <ProductGrid filters={filters} gridView={gridView} sortBy={sortBy} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Catalog;
