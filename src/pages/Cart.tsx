import { useState } from "react";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronRight,
  Package,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBar from "@/components/PromoBar";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "batik10") {
      setPromoApplied(true);
    }
  };

  const discount = promoApplied ? getTotalPrice() * 0.1 : 0;
  const finalTotal = getTotalPrice() - discount;

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
        <PromoBar />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            {/* Animated Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Discover our beautiful collection of handcrafted batik pieces and add something special.
            </p>
            
            <Link to="/catalog">
              <Button size="lg" className="gap-2 rounded-xl h-12 px-8">
                <Sparkles className="h-4 w-4" />
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Suggestions */}
            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">Popular categories</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/catalog?category=Batik+Tulis">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent/20 transition-colors">
                    Batik Tulis
                  </Badge>
                </Link>
                <Link to="/catalog?category=Ready+To+Wear">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent/20 transition-colors">
                    Ready To Wear
                  </Badge>
                </Link>
                <Link to="/catalog?subcategory=Sutra">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent/20 transition-colors">
                    Silk Collection
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <PromoBar />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Link to="/catalog">
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="hidden md:flex items-center justify-center gap-4 mb-10 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <span className="font-medium">Cart</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span>Checkout</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span>Complete</span>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={`${item.id}-${item.size}`}
                className={cn(
                  "group bg-card border border-border/50 rounded-2xl p-4 md:p-6",
                  "hover:shadow-lg hover:border-accent/20 transition-all duration-300",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4 md:gap-6">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate pr-2">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Size: <span className="font-medium text-foreground">{item.size}</span>
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-background"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-background"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            Rp {item.price.toLocaleString()} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-20 space-y-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              
              {/* Promo Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="pl-10 rounded-xl"
                      disabled={promoApplied}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    disabled={!promoCode || promoApplied}
                    className="rounded-xl"
                  >
                    {promoApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    10% discount applied!
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Try: BATIK10</p>
              </div>

              <Separator />
              
              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({getTotalItems()} items)
                  </span>
                  <span className="font-medium">Rp {getTotalPrice().toLocaleString()}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount (10%)</span>
                    <span>- Rp {discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent font-medium">Free</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      Rp {finalTotal.toLocaleString()}
                    </span>
                    {promoApplied && (
                      <p className="text-xs text-muted-foreground line-through">
                        Rp {getTotalPrice().toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full h-12 text-base font-semibold rounded-xl gap-2" 
                size="lg" 
                onClick={() => navigate("/checkout")}
              >
                <ShoppingBag className="h-4 w-4" />
                Checkout as Guest
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              {/* Guest Checkout Info */}
              <p className="text-xs text-center text-muted-foreground">
                No account needed • Track your order via email
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Truck className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <RotateCcw className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">Easy Returns</span>
                </div>
              </div>

              {/* Secure Checkout Notice */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3 w-3" />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">You might also like</h2>
            <Link to="/catalog">
              <Button variant="ghost" className="gap-1 text-accent">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Batik Tulis Premium", price: 850000, image: "https://images.unsplash.com/photo-1610652492249-b6e5e4e57788?q=80&w=400" },
              { name: "Elegant Sutra Batik", price: 1500000, image: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?q=80&w=400" },
              { name: "Casual Batik Shirt", price: 380000, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400" },
              { name: "Modern Ready To Wear", price: 950000, image: "https://images.unsplash.com/photo-1598032895397-b9c37bfb9a52?q=80&w=400" },
            ].map((product, index) => (
              <Link 
                key={index} 
                to="/catalog"
                className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/20 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{product.name}</h3>
                  <p className="text-sm font-bold mt-1">Rp {product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
