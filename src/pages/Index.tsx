import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Sparkles, 
  Truck, 
  Shield, 
  Award,
  Star,
  ChevronRight,
  Play,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-image.jpg";
import cottonImage from "@/assets/collection-cotton.jpg";
import dobbyImage from "@/assets/collection-dobby.jpg";
import longsleeveImage from "@/assets/collection-longsleeve.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Categories Section */}
        <CategoriesSection />
        
        {/* Featured Products */}
        <FeaturedProducts />
        
      </main>
      <Footer />
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium batik fashion collection"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

// Categories Section Component
const CategoriesSection = () => {
  const categories = [
    {
      title: "Batik Tulis",
      subtitle: "Handcrafted Excellence",
      image: cottonImage,
      // Select all Batik Tulis subcategories: katun and sutra
      link: "/catalog?category_id=batik-tulis&subcategory_id=katun,sutra",
      badge: "Premium",
    },
    {
      title: "Ready To Wear",
      subtitle: "Modern Convenience",
      image: dobbyImage,
      // Select all Ready To Wear subcategories: batik-tulis-sutra and batik-casual
      link: "/catalog?category_id=ready-to-wear&subcategory_id=batik-tulis-sutra,batik-casual",
      badge: "Popular",
    },
    {
      title: "Silk Collection",
      subtitle: "Luxurious Elegance",
      image: longsleeveImage,
      // Select Sutra subcategory from Batik Tulis
      link: "/catalog?category_id=batik-tulis&subcategory_id=sutra",
      badge: "Exclusive",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4">Our Collections</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Explore By Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our curated collections, each celebrating the rich heritage of Indonesian batik
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Link 
              key={index} 
              to={category.link}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] cursor-pointer"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-foreground hover:bg-white">
                  {category.badge}
                </Badge>
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-white/70 text-sm mb-1">{category.subtitle}</p>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-4">
                  {category.title}
                </h3>
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-4 transition-all">
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Component
const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Premium Batik Tulis Katun",
      price: 850000,
      image: "https://images.unsplash.com/photo-1610652492249-b6e5e4e57788?q=80&w=600",
      badge: "New",
    },
    {
      id: 4,
      name: "Elegant Batik Tulis Sutra",
      price: 1500000,
      image: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?q=80&w=600",
      badge: "Best Seller",
    },
    {
      id: 7,
      name: "Modern Ready To Wear Sutra",
      price: 950000,
      image: "https://images.unsplash.com/photo-1598032895397-b9c37bfb9a52?q=80&w=600",
    },
    {
      id: 9,
      name: "Casual Batik Shirt",
      price: 380000,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600",
      badge: "Popular",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="outline" className="mb-4">Featured</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link to="/catalog">
            <Button variant="outline" className="gap-2 rounded-xl">
              View All Products
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <Link 
              key={product.id}
              to="/catalog"
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-card border mb-4">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {product.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-accent text-accent-foreground">
                      {product.badge}
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="font-medium text-sm md:text-base line-clamp-2 group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <p className="font-bold mt-1">
                Rp {product.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Index;
