import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  ArrowRight, 
  Check, 
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Ruler,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

// Default sizes to display if product doesn't have allSizes
const DEFAULT_ALL_SIZES = ["S", "M", "L", "XL", "XXL", "Custom"];

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductModal = ({ product, open, onOpenChange }: ProductModalProps) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Reset state when modal opens/closes or auto-select for single size products
  useEffect(() => {
    if (!open) {
      setSelectedSize("");
      setQuantity(1);
    } else if (product?.isSingleSize && product.sizes.length === 1) {
      // Auto-select the only available size for single size products
      setSelectedSize(product.sizes[0]);
      setQuantity(1); // Unique pieces are limited to 1
    }
  }, [open, product]);

  if (!product) return null;
  
  // Check if this is a unique single-size product
  const isUniqueProduct = product.isSingleSize && product.sizes.length === 1;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} (Size: ${selectedSize})`,
    });
    
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    
    // Add to cart
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      size: selectedSize,
      quantity: quantity,
    });
    
    // Close modal and navigate to cart
    onOpenChange(false);
    navigate("/cart");
  };

  const getDescription = () => {
    if (product.description) return product.description;
    
    // Special description for unique single-size products with motif
    if (isUniqueProduct && product.motif) {
      return `This is a one-of-a-kind "${product.motif}" motif piece, handcrafted with authentic batik tulis technique on premium silk. As a unique creation, this exact design is only available in size ${product.sizes[0]}. Each stroke tells a story of Indonesian heritage and masterful artistry.`;
    }
    
    const categoryDescriptions: Record<string, Record<string, string>> = {
      "Batik Tulis": {
        "Katun": "Premium hand-drawn batik on high-quality cotton fabric. Perfect for everyday elegance, this piece combines breathable comfort with traditional craftsmanship. Each stroke is carefully applied by skilled artisans.",
        "Sutra": "Luxurious hand-drawn batik on finest silk fabric. This exquisite piece represents the pinnacle of batik artistry, combining the smooth elegance of silk with intricate traditional patterns.",
      },
      "Ready To Wear": {
        "Batik Tulis/Sutra": "Ready-to-wear batik crafted from premium silk with authentic batik tulis patterns. Perfect for special occasions, this piece combines convenience with traditional luxury.",
        "Batik Casual": "Contemporary casual wear featuring batik-inspired designs. Perfect for everyday style, combining modern comfort with Indonesian cultural heritage.",
      },
    };
    
    return categoryDescriptions[product.category]?.[product.subcategory || ""] || 
      `Beautiful ${product.category.toLowerCase()} piece crafted with traditional Indonesian batik techniques. Each piece is unique and showcases intricate patterns that represent cultural heritage and artistic excellence.`;
  };
  
  const description = getDescription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Product details for {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 h-full">
          {/* Product Image Section */}
          <div className="relative bg-secondary/30 p-6 md:p-8 flex items-center justify-center">
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isUniqueProduct && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  ✦ One of a Kind
                </Badge>
              )}
              {product.isNew && (
                <Badge className="bg-accent text-accent-foreground border-0">
                  New Arrival
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-primary text-primary-foreground border-0">
                  Best Seller
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isWishlisted 
                    ? "bg-red-500 text-white" 
                    : "bg-white/80 backdrop-blur-sm hover:bg-white text-foreground"
                )}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </button>
              <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
                <Share2 className="h-4 w-4 text-foreground" />
              </button>
            </div>
            
            <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400";
                }}
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] md:max-h-[95vh] space-y-6">
            {/* Category & Subcategory */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-medium text-accent">
                {product.category}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {product.subcategory}
              </span>
            </div>

            {/* Product Name & Motif */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                {product.name}
              </h2>
              {isUniqueProduct && product.motif && (
                <p className="text-sm text-muted-foreground mt-1">
                  Motif: <span className="font-medium text-foreground">{product.motif}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                Rp {product.price.toLocaleString()}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">About this piece</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {/* Size Selection - Different UI for single size products */}
            {isUniqueProduct ? (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                    <span className="text-lg font-bold text-accent">{product.sizes[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Unique Piece</h3>
                    <p className="text-xs text-muted-foreground">
                      This {product.motif && `"${product.motif}" motif`} is only available in size {product.sizes[0]}
                    </p>
                  </div>
                  <Check className="ml-auto h-5 w-5 text-accent" />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Select Size</h3>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    <Ruler className="h-3 w-3" />
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {(product.allSizes || DEFAULT_ALL_SIZES).map((size) => {
                    const isAvailable = product.sizes.includes(size);
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button
                        key={`${product.id}-${size}`}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        className={cn(
                          "relative flex items-center justify-center py-3 rounded-xl text-sm font-medium transition-all",
                          isAvailable && !isSelected && "border-2 border-border hover:border-accent/50 hover:bg-accent/5 cursor-pointer",
                          isAvailable && isSelected && "border-2 border-accent bg-accent/10 text-accent",
                          !isAvailable && "border-2 border-muted/50 bg-muted/20 text-muted-foreground/30 cursor-not-allowed line-through"
                        )}
                      >
                        {size}
                        {isSelected && (
                          <Check className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-white rounded-full p-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-accent" />
                    Select an available size to continue
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector - Limited to 1 for unique products */}
            {isUniqueProduct ? (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <span className="text-lg font-semibold">1</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Unique Item
                </Badge>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-none hover:bg-muted"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold w-14 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-none hover:bg-muted"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">Max 10 per order</span>
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Price</span>
                <span className="text-2xl font-bold text-foreground">
                  Rp {(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 h-12 text-base font-semibold rounded-xl"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold rounded-xl"
                variant="outline"
                size="lg"
                onClick={handleBuyNow}
              >
                Buy Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Truck className="h-4 w-4 text-accent" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Shield className="h-4 w-4 text-accent" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">Authentic Batik</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <RotateCcw className="h-4 w-4 text-accent" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Size Guide Modal */}
      <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Ruler className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Size Guide</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Find your perfect fit with our size chart
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 pt-4 overflow-auto">
            <div className="rounded-xl overflow-hidden border border-border bg-white">
              <img 
                src="/sizechart.png" 
                alt="Size Chart" 
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              * Measurements are in centimeters. If you're between sizes, we recommend sizing up for a more comfortable fit.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ProductModal;
