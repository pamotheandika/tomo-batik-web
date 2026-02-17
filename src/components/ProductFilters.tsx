import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Sparkles, 
  Shirt, 
  Tag, 
  Palette, 
  Check, 
  X,
  RotateCcw,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: {
    category: string[];
    subcategory: string[];
    size: string[];
    color: string[];
    priceRange: number[];
  };
  setFilters: (filters: any) => void;
  onReset?: () => void;
}

// Category structure with API IDs and display names
const categoryStructure = [
  {
    id: "batik-tulis",
    name: "Batik Tulis",
    icon: Sparkles,
    subcategories: [
      { id: "katun", name: "Katun" },
      { id: "sutra", name: "Sutra" },
    ],
  },
  {
    id: "ready-to-wear",
    name: "Ready To Wear",
    icon: Shirt,
    subcategories: [
      { id: "batik-tulis-sutra", name: "Batik Tulis/Sutra" },
      { id: "batik-casual", name: "Batik Casual" },
    ],
  },
];

// Color options for filter
const colorOptions = [
  { id: 'white-green', name: 'White Green', colors: ['#FFFFFF', '#228B22'], inStock: true },
  { id: 'red-orange', name: 'Red Orange', colors: ['#DC2626', '#FF4500'], inStock: true },
  { id: 'red', name: 'Red', colors: ['#DC2626'], inStock: true },
  { id: 'white-red', name: 'White Red', colors: ['#FFFFFF', '#DC2626'], inStock: true },
  { id: 'black', name: 'Black', colors: ['#1C1C1C'], inStock: true },
];

// Helper to generate swatch background style
const getSwatchStyle = (colors: string[]) => {
  if (colors.length === 2) {
    return { background: `linear-gradient(to right, ${colors[0]} 50%, ${colors[1]} 50%)` };
  }
  return { backgroundColor: colors[0] };
};

const ProductFilters = ({ filters, setFilters, onReset }: ProductFiltersProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["batik-tulis", "ready-to-wear"]);
  const sizes = ["S", "M", "L", "XL", "XXL", "Custom"];

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const category = categoryStructure.find(c => c.id === categoryId);
    const subcategoryIds = category?.subcategories.map(s => s.id) || [];
    
    if (checked) {
      setFilters({
        ...filters,
        category: [...filters.category, categoryId],
        subcategory: [...new Set([...filters.subcategory, ...subcategoryIds])],
      });
    } else {
      setFilters({
        ...filters,
        category: filters.category.filter((c) => c !== categoryId),
        subcategory: filters.subcategory.filter((s) => !subcategoryIds.includes(s)),
      });
    }
  };

  const handleSubcategoryChange = (subcategoryId: string, parentCategoryId: string, checked: boolean) => {
    const parentCategory = categoryStructure.find(c => c.id === parentCategoryId);
    const parentSubcategoryIds = parentCategory?.subcategories.map(s => s.id) || [];
    
    let newSubcategories: string[];
    let newCategories = [...filters.category];

    if (checked) {
      newSubcategories = [...filters.subcategory, subcategoryId];
      const allSubcategoriesSelected = parentSubcategoryIds.every((subId) =>
        newSubcategories.includes(subId)
      );
      if (allSubcategoriesSelected && !newCategories.includes(parentCategoryId)) {
        newCategories.push(parentCategoryId);
      }
    } else {
      newSubcategories = filters.subcategory.filter((s) => s !== subcategoryId);
      const anySubcategorySelected = parentSubcategoryIds.some((subId) =>
        newSubcategories.includes(subId)
      );
      if (!anySubcategorySelected) {
        newCategories = newCategories.filter((c) => c !== parentCategoryId);
      }
    }

    setFilters({
      ...filters,
      category: newCategories,
      subcategory: newSubcategories,
    });
  };

  const handleSizeChange = (size: string) => {
    setFilters({
      ...filters,
      size: filters.size.includes(size)
        ? filters.size.filter((s) => s !== size)
        : [...filters.size, size],
    });
  };

  const handleColorChange = (colorId: string) => {
    setFilters({
      ...filters,
      color: filters.color.includes(colorId)
        ? filters.color.filter((c) => c !== colorId)
        : [...filters.color, colorId],
    });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters({
      ...filters,
      priceRange: value,
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = categoryStructure.find(c => c.id === categoryId);
    const subcategoryIds = category?.subcategories.map(s => s.id) || [];
    const selectedCount = subcategoryIds.filter((subId) => filters.subcategory.includes(subId)).length;
    return selectedCount > 0 && selectedCount < subcategoryIds.length;
  };

  const hasActiveFilters = 
    filters.category.length > 0 ||
    filters.subcategory.length > 0 ||
    filters.size.length > 0 ||
    filters.color.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000;

  const handleReset = () => {
    const resetFilters = {
      category: [],
      subcategory: [],
      size: [],
      color: [],
      priceRange: [0, 5000000],
    };
    setFilters(resetFilters);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-0.5 bg-gradient-to-b from-foreground/60 to-foreground/20 rounded-full" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Category</span>
            {filters.category.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-foreground/10 text-foreground rounded-full font-medium">
                {filters.category.length}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {categoryStructure.map(({ id: categoryId, name: categoryName, icon: Icon, subcategories }) => {
              const isExpanded = expandedCategories.includes(categoryId);
              const isSelected = filters.category.includes(categoryId);
              const isPartiallySelected = isCategoryPartiallySelected(categoryId);
              
              return (
                <div key={categoryId} className="space-y-1">
                  {/* Main Category */}
                  <div 
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer",
                      "hover:bg-muted/50 border border-transparent",
                      isSelected && "bg-muted/30 border-border/50",
                      isPartiallySelected && !isSelected && "bg-muted/20 border-border/40"
                    )}
                    onClick={() => toggleCategoryExpansion(categoryId)}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200",
                      isSelected 
                        ? "bg-foreground text-background shadow-sm" 
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id={`category-${categoryId}`}
                          checked={isSelected}
                          className={cn(
                            "transition-all duration-200",
                            isPartiallySelected && !isSelected && "data-[state=unchecked]:bg-foreground/20 data-[state=unchecked]:border-foreground/40"
                          )}
                          onCheckedChange={(checked) => {
                            handleCategoryChange(categoryId, checked as boolean);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label
                          htmlFor={`category-${categoryId}`}
                          className="text-sm font-medium cursor-pointer flex-1 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categoryName}
                        </Label>
                      </div>
                    </div>

                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                        isExpanded && "rotate-180"
                      )} 
                    />
                  </div>
                  
                  {/* Subcategories - Animated */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="ml-12 pl-4 border-l-2 border-muted/60 space-y-1 pt-1">
                      {subcategories.map(({ id: subcategoryId, name: subcategoryName }) => {
                        const isSubSelected = filters.subcategory.includes(subcategoryId);
                        return (
                          <div 
                            key={subcategoryId} 
                            className={cn(
                              "flex items-center gap-2.5 py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer",
                              "hover:bg-muted/40",
                              isSubSelected && "bg-muted/60"
                            )}
                            onClick={() => handleSubcategoryChange(subcategoryId, categoryId, !isSubSelected)}
                          >
                            <Checkbox
                              id={`subcategory-${subcategoryId}`}
                              checked={isSubSelected}
                              onCheckedChange={(checked) =>
                                handleSubcategoryChange(subcategoryId, categoryId, checked as boolean)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Label
                              htmlFor={`subcategory-${subcategoryId}`}
                              className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {subcategoryName}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Filter */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Color</span>
            {filters.color.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-foreground/10 text-foreground rounded-full font-medium">
                {filters.color.length}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Selected colors display */}
            {filters.color.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-sm text-foreground font-medium">
                  {filters.color.length === 1 
                    ? colorOptions.find(c => c.id === filters.color[0])?.name
                    : `${filters.color.length} colors selected`
                  }
                </span>
                <button
                  onClick={() => setFilters({ ...filters, color: [] })}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </div>
            )}
            
            {/* Color Swatches */}
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((color) => {
                const isSelected = filters.color.includes(color.id);
                const isOutOfStock = !color.inStock;
                
                return (
                  <div key={color.id} className="group relative">
                    <button
                      onClick={() => !isOutOfStock && handleColorChange(color.id)}
                      disabled={isOutOfStock}
                      className={cn(
                        "relative w-10 h-10 rounded-full transition-all duration-200 ease-out",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isSelected 
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background shadow-md scale-110" 
                          : "ring-1 ring-border/60 hover:ring-border hover:scale-105 hover:shadow-sm",
                        isOutOfStock && "opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-none"
                      )}
                      style={getSwatchStyle(color.colors)}
                      aria-label={`${color.name}${isOutOfStock ? ' (Out of stock)' : ''}`}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check 
                            className={cn(
                              "h-4 w-4 drop-shadow-md",
                              color.colors[0] === '#FFFFFF' || color.colors[0] === '#E8B4B8' 
                                ? "text-foreground" 
                                : "text-white"
                            )} 
                            strokeWidth={3}
                          />
                        </span>
                      )}
                      
                      {isOutOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-muted-foreground/60 rotate-45 rounded-full" />
                        </span>
                      )}
                    </button>
                    
                    {/* Tooltip */}
                    <div className={cn(
                      "absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md",
                      "bg-foreground text-background text-xs font-medium whitespace-nowrap",
                      "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                      "transition-all duration-150 ease-out transform",
                      "group-hover:-translate-y-0.5",
                      "pointer-events-none z-50 shadow-lg"
                    )}>
                      {color.name}
                      {isOutOfStock && <span className="text-background/70 ml-1">(Out of stock)</span>}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Size Filter */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Size</span>
            {filters.size.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-foreground/10 text-foreground rounded-full font-medium">
                {filters.size.length}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            {sizes.map((size) => {
              const isSelected = filters.size.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={cn(
                    "py-2.5 px-3 text-sm font-medium rounded-xl border-2 transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isSelected
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/60 hover:border-foreground/40 text-muted-foreground hover:text-foreground bg-background"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">Rp</span>
            </div>
            <span className="text-sm font-medium text-foreground">Price Range</span>
          </div>

          {/* Price Display */}
          <div className="flex items-center justify-between gap-3">
            <div className="px-3 py-2 bg-muted/50 rounded-xl font-medium text-sm min-w-[100px] text-center">
              Rp {filters.priceRange[0].toLocaleString()}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-muted via-border to-muted" />
            <div className="px-3 py-2 bg-muted/50 rounded-xl font-medium text-sm min-w-[100px] text-center">
              Rp {filters.priceRange[1].toLocaleString()}
            </div>
          </div>
          
          <div className="pt-2 px-1">
            <Slider
              min={0}
              max={5000000}
              step={100000}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              className="w-full"
            />
          </div>

          {/* Quick Price Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: "Under 500K", range: [0, 500000] },
              { label: "500K - 1M", range: [500000, 1000000] },
              { label: "1M - 2M", range: [1000000, 2000000] },
              { label: "Over 2M", range: [2000000, 5000000] },
            ].map(({ label, range }) => {
              const isActive = filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1];
              return (
                <button
                  key={label}
                  onClick={() => handlePriceChange(range)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isActive
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-background"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
