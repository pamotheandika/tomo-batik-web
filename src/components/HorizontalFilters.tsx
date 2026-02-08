import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronDown, 
  Sparkles, 
  Shirt, 
  Tag, 
  Palette, 
  X,
  RotateCcw,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalFiltersProps {
  filters: {
    category: string[];
    subcategory: string[];
    size: string[];
    color: string[];
    priceRange: number[];
  };
  setFilters: (filters: any) => void;
  onReset?: () => void;
  hideCategory?: boolean; // Hide category filter (useful for brand pages)
}

// Category structure
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

// Color options
const colorOptions = [
  { id: 'white-green', name: 'White Green', colors: ['#FFFFFF', '#228B22'], inStock: true },
  { id: 'red-orange', name: 'Red Orange', colors: ['#DC2626', '#FF4500'], inStock: true },
  { id: 'red', name: 'Red', colors: ['#DC2626'], inStock: true },
  { id: 'white-red', name: 'White Red', colors: ['#FFFFFF', '#DC2626'], inStock: true },
  { id: 'black', name: 'Black', colors: ['#1C1C1C'], inStock: true },
];

const sizes = ["S", "M", "L", "XL", "XXL", "Custom"];

const HorizontalFilters = ({ filters, setFilters, onReset, hideCategory = false }: HorizontalFiltersProps) => {
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});

  const togglePopover = (key: string) => {
    setOpenPopovers(prev => ({ ...prev, [key]: !prev[key] }));
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
    let newCategories = hideCategory ? [...filters.category] : [...filters.category]; // Don't change category if hideCategory is true

    if (checked) {
      newSubcategories = [...filters.subcategory, subcategoryId];
      // Only auto-select category if hideCategory is false
      if (!hideCategory) {
        const allSubcategoriesSelected = parentSubcategoryIds.every((subId) =>
          newSubcategories.includes(subId)
        );
        if (allSubcategoriesSelected && !newCategories.includes(parentCategoryId)) {
          newCategories.push(parentCategoryId);
        }
      }
    } else {
      newSubcategories = filters.subcategory.filter((s) => s !== subcategoryId);
      // Only auto-remove category if hideCategory is false
      if (!hideCategory) {
        const anySubcategorySelected = parentSubcategoryIds.some((subId) =>
          newSubcategories.includes(subId)
        );
        if (!anySubcategorySelected) {
          newCategories = newCategories.filter((c) => c !== parentCategoryId);
        }
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

  const clearCategory = () => {
    setFilters({
      ...filters,
      category: [],
      subcategory: [],
    });
  };

  const clearSize = () => {
    setFilters({
      ...filters,
      size: [],
    });
  };

  const clearColor = () => {
    setFilters({
      ...filters,
      color: [],
    });
  };

  const clearPrice = () => {
    setFilters({
      ...filters,
      priceRange: [0, 3000000],
    });
  };

  const hasActiveFilters = 
    filters.category.length > 0 ||
    filters.subcategory.length > 0 ||
    filters.size.length > 0 ||
    filters.color.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 3000000;

  const handleReset = () => {
    const resetFilters = {
      category: [],
      subcategory: [],
      size: [],
      color: [],
      priceRange: [0, 3000000],
    };
    setFilters(resetFilters);
    if (onReset) {
      onReset();
    }
  };

  // Get all subcategories for display
  // Show all subcategories from all categories (katun, sutra, batik-tulis-sutra, batik-casual)
  const allSubcategories = categoryStructure.flatMap(cat => 
    cat.subcategories.map(sub => ({
      ...sub,
      parentId: cat.id,
      parentName: cat.name,
    }))
  );

  return (
    <div className="w-full">
      {/* Horizontal Filter Bar - Scrollable on mobile */}
      <div className="flex items-center gap-3 pb-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 min-w-max">
        {/* Category Filter - Hidden when hideCategory is true */}
        {!hideCategory && (
        <Popover open={openPopovers.category} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, category: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
                (filters.category.length > 0 || filters.subcategory.length > 0)
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                  : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
              )}
            >
              <Tag className={cn(
                "h-3.5 w-3.5 transition-colors",
                (filters.category.length > 0 || filters.subcategory.length > 0) && "text-background"
              )} />
              <span className="text-sm font-medium">Category</span>
              {(filters.category.length > 0 || filters.subcategory.length > 0) && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-2 text-xs rounded-full bg-background/20 text-background border-0">
                  {filters.category.length + filters.subcategory.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                openPopovers.category && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98" align="start">
            <Command className="rounded-xl">
              <CommandList className="max-h-[280px] p-2">
                <CommandGroup>
                  {categoryStructure.map(({ id: categoryId, name: categoryName, icon: Icon, subcategories }) => {
                    const isCategorySelected = filters.category.includes(categoryId);
                    const selectedSubs = subcategories.filter(sub => filters.subcategory.includes(sub.id));
                    const isPartiallySelected = selectedSubs.length > 0 && selectedSubs.length < subcategories.length;
                    
                    return (
                      <div key={categoryId} className="space-y-1 mb-1.5">
                        <CommandItem
                          onSelect={() => handleCategoryChange(categoryId, !isCategorySelected)}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-lg transition-all duration-200",
                            "hover:bg-muted/60 active:scale-[0.98]",
                            isCategorySelected && "bg-muted/40"
                          )}
                        >
                          <Checkbox
                            checked={isCategorySelected}
                            className={cn(
                              "h-4 w-4 transition-all duration-200",
                              isPartiallySelected && !isCategorySelected && "data-[state=unchecked]:bg-foreground/20 data-[state=unchecked]:border-foreground/40"
                            )}
                          />
                          <Icon className={cn(
                            "h-3.5 w-3.5 transition-colors duration-200",
                            isCategorySelected ? "text-foreground" : "text-muted-foreground"
                          )} />
                          <span className="flex-1 font-medium text-xs">{categoryName}</span>
                        </CommandItem>
                        <div className="ml-8 space-y-0.5 pl-2 border-l-2 border-muted/40">
                          {subcategories.map(({ id: subcategoryId, name: subcategoryName }) => {
                            const isSubSelected = filters.subcategory.includes(subcategoryId);
                            return (
                              <CommandItem
                                key={subcategoryId}
                                onSelect={() => handleSubcategoryChange(subcategoryId, categoryId, !isSubSelected)}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md transition-all duration-200",
                                  "hover:bg-muted/50 active:scale-[0.98]",
                                  isSubSelected && "bg-muted/30"
                                )}
                              >
                                <Checkbox checked={isSubSelected} className="h-3.5 w-3.5 transition-all duration-200" />
                                <span className={cn(
                                  "text-xs transition-colors duration-200",
                                  isSubSelected ? "text-foreground font-medium" : "text-muted-foreground"
                                )}>{subcategoryName}</span>
                              </CommandItem>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              {(filters.category.length > 0 || filters.subcategory.length > 0) && (
                <div className="border-t border-border/40 p-2 bg-muted/10 rounded-b-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCategory}
                    className="w-full h-8 text-xs rounded-lg hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        )}

        {/* Subcategory Filter - Shown when category is hidden (brand pages) */}
        {hideCategory && allSubcategories.length > 0 && (
          <Popover open={openPopovers.subcategory} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, subcategory: open }))}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
                  filters.subcategory.length > 0
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                    : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
                )}
              >
                <Tag className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  filters.subcategory.length > 0 && "text-background"
                )} />
                <span className="text-sm font-medium">Subcategory</span>
                {filters.subcategory.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 px-2 text-xs rounded-full bg-background/20 text-background border-0">
                    {filters.subcategory.length}
                  </Badge>
                )}
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  openPopovers.subcategory && "rotate-180"
                )} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98" align="start">
              <Command className="rounded-xl">
                <CommandList className="max-h-[280px] p-2">
                  <CommandGroup>
                    {allSubcategories.map(({ id: subcategoryId, name: subcategoryName, parentId, parentName }) => {
                      const isSelected = filters.subcategory.includes(subcategoryId);
                      return (
                        <CommandItem
                          key={subcategoryId}
                          onSelect={() => {
                            handleSubcategoryChange(subcategoryId, parentId, !isSelected);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-lg transition-all duration-200",
                            "hover:bg-muted/60 active:scale-[0.98]",
                            isSelected && "bg-muted/40"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="h-4 w-4 transition-all duration-200"
                          />
                          <span className={cn(
                            "text-xs font-medium transition-colors duration-200",
                            isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                          )}>{subcategoryName}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
                {filters.subcategory.length > 0 && (
                  <div className="border-t border-border/40 p-2 bg-muted/10 rounded-b-xl">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          subcategory: [],
                        });
                      }}
                      className="w-full h-8 text-xs rounded-lg hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Color Filter */}
        <Popover open={openPopovers.color} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, color: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
                filters.color.length > 0
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                  : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
              )}
            >
              <Palette className={cn(
                "h-3.5 w-3.5 transition-colors",
                filters.color.length > 0 && "text-background"
              )} />
              <span className="text-sm font-medium">Color</span>
              {filters.color.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-2 text-xs rounded-full bg-background/20 text-background border-0">
                  {filters.color.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                openPopovers.color && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98" align="start">
            <Command className="rounded-xl">
              <CommandList className="max-h-[280px] p-2">
                <CommandGroup>
                  <div className="space-y-0.5">
                    {colorOptions.map((color) => {
                      const isSelected = filters.color.includes(color.id);
                      const isOutOfStock = !color.inStock;
                      
                      return (
                        <CommandItem
                          key={color.id}
                          onSelect={() => !isOutOfStock && handleColorChange(color.id)}
                          disabled={isOutOfStock}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-lg transition-all duration-200",
                            "hover:bg-muted/60 active:scale-[0.98]",
                            isSelected && "bg-muted/40",
                            isOutOfStock && "opacity-50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="h-4 w-4 transition-all duration-200"
                          />
                          <span className={cn(
                            "text-xs flex-1 font-medium transition-colors duration-200",
                            isOutOfStock ? "text-muted-foreground line-through" : "text-foreground",
                            isSelected && "font-semibold"
                          )}>
                            {color.name}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              </CommandList>
              {filters.color.length > 0 && (
                <div className="border-t border-border/40 p-2 bg-muted/10 rounded-b-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearColor}
                    className="w-full h-8 text-xs rounded-lg hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>

        {/* Size Filter */}
        <Popover open={openPopovers.size} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, size: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
                filters.size.length > 0
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                  : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
              )}
            >
              <GripVertical className={cn(
                "h-3.5 w-3.5 transition-colors",
                filters.size.length > 0 && "text-background"
              )} />
              <span className="text-sm font-medium">Size</span>
              {filters.size.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-2 text-xs rounded-full bg-background/20 text-background border-0">
                  {filters.size.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                openPopovers.size && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98" align="start">
            <Command className="rounded-xl">
              <CommandList className="max-h-[280px] p-2">
                <CommandGroup>
                  <div className="space-y-0.5">
                    {sizes.map((size) => {
                      const isSelected = filters.size.includes(size);
                      return (
                        <CommandItem
                          key={size}
                          onSelect={() => handleSizeChange(size)}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-lg transition-all duration-200",
                            "hover:bg-muted/60 active:scale-[0.98]",
                            isSelected && "bg-muted/40"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            className="h-4 w-4 transition-all duration-200"
                          />
                          <span className={cn(
                            "text-xs font-medium transition-colors duration-200",
                            isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                          )}>{size}</span>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              </CommandList>
              {filters.size.length > 0 && (
                <div className="border-t border-border/40 p-2 bg-muted/10 rounded-b-xl">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSize}
                    className="w-full h-8 text-xs rounded-lg hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>

        {/* Price Range Filter */}
        <Popover open={openPopovers.price} onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, price: open }))}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 px-4 gap-2.5 rounded-full border-0 backdrop-blur-sm transition-all duration-300 flex-shrink-0 shadow-sm hover:shadow-md",
                filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                  : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background/90"
              )}
            >
              <span className={cn(
                "text-xs font-semibold transition-colors",
                (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000) && "text-background"
              )}>Rp</span>
              <span className="text-sm font-medium">Price</span>
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000) && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-2 text-xs rounded-full bg-background/20 text-background border-0">
                  Active
                </Badge>
              )}
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                openPopovers.price && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 rounded-xl border border-border/40 shadow-xl backdrop-blur-xl bg-background/98" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="px-3 py-1.5 bg-muted/40 rounded-lg font-semibold text-xs min-w-[90px] text-center shadow-sm border border-border/30">
                  Rp {filters.priceRange[0].toLocaleString()}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-muted via-border/40 to-muted" />
                <div className="px-3 py-1.5 bg-muted/40 rounded-lg font-semibold text-xs min-w-[90px] text-center shadow-sm border border-border/30">
                  Rp {filters.priceRange[1].toLocaleString()}
                </div>
              </div>
              
              <div className="px-1">
                <Slider
                  min={0}
                  max={3000000}
                  step={100000}
                  value={filters.priceRange}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Under 500K", range: [0, 500000] },
                  { label: "500K - 1M", range: [500000, 1000000] },
                  { label: "1M - 2M", range: [1000000, 2000000] },
                  { label: "Over 2M", range: [2000000, 3000000] },
                ].map(({ label, range }) => {
                  const isActive = filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1];
                  return (
                    <Button
                      key={label}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePriceChange(range)}
                      className={cn(
                        "text-xs rounded-lg transition-all duration-200 h-8",
                        "hover:scale-105 active:scale-[0.98]",
                        isActive 
                          ? "shadow-md" 
                          : "hover:bg-muted/60 border-border/60"
                      )}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
              
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 3000000) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPrice}
                  className="w-full h-8 text-xs rounded-lg hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset All Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-10 px-4 gap-2 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 flex-shrink-0 transition-all duration-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all
          </Button>
        )}
        </div>
      </div>

      {/* Active Filter Badges - Scrollable on mobile */}
      {(filters.category.length > 0 || filters.subcategory.length > 0 || filters.size.length > 0 || filters.color.length > 0) && (
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/30 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2.5 min-w-max">
          <span className="text-xs text-muted-foreground font-medium">Active:</span>
          
          {/* Category badges */}
          {filters.category.map(catId => {
            const cat = categoryStructure.find(c => c.id === catId);
            if (!cat) return null;
            return (
              <Badge
                key={catId}
                variant="secondary"
                className="h-7 px-3 text-xs gap-1.5 rounded-full bg-muted/60 hover:bg-muted/80 transition-all duration-200 shadow-sm"
              >
                {cat.name}
                <button
                  onClick={() => handleCategoryChange(catId, false)}
                  className="ml-0.5 hover:bg-foreground/20 rounded-full p-0.5 transition-all duration-200 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          
          {/* Subcategory badges */}
          {filters.subcategory.map(subId => {
            const sub = allSubcategories.find(s => s.id === subId);
            if (!sub) return null;
            return (
              <Badge
                key={subId}
                variant="secondary"
                className="h-7 px-3 text-xs gap-1.5 rounded-full bg-muted/60 hover:bg-muted/80 transition-all duration-200 shadow-sm"
              >
                {sub.name}
                <button
                  onClick={() => handleSubcategoryChange(subId, sub.parentId, false)}
                  className="ml-0.5 hover:bg-foreground/20 rounded-full p-0.5 transition-all duration-200 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          
          {/* Size badges */}
          {filters.size.map(size => (
            <Badge
              key={size}
              variant="secondary"
              className="h-7 px-3 text-xs gap-1.5 rounded-full bg-muted/60 hover:bg-muted/80 transition-all duration-200 shadow-sm"
            >
              {size}
              <button
                onClick={() => handleSizeChange(size)}
                className="ml-0.5 hover:bg-foreground/20 rounded-full p-0.5 transition-all duration-200 hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {/* Color badges */}
          {filters.color.map(colorId => {
            const color = colorOptions.find(c => c.id === colorId);
            if (!color) return null;
            return (
              <Badge
                key={colorId}
                variant="secondary"
                className="h-7 px-3 text-xs gap-1.5 items-center rounded-full bg-muted/60 hover:bg-muted/80 transition-all duration-200 shadow-sm"
              >
                {color.name}
                <button
                  onClick={() => handleColorChange(colorId)}
                  className="ml-0.5 hover:bg-foreground/20 rounded-full p-0.5 transition-all duration-200 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalFilters;

