import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import cottonImage from "@/assets/collection-cotton.jpg";
import dobbyImage from "@/assets/collection-dobby.jpg";

/**
 * Global Homepage - Displays two full-width clickable brand images
 * Brand A: Batik Tulis
 * Brand B: Batik Ready to Wear
 * Enhanced with modern animations and visual effects
 */
const Home = () => {
  const brands = [
    {
      id: "batik-tulis",
      name: "Batik Tulis",
      subtitle: "Handcrafted Excellence",
      image: cottonImage,
      link: "/batik-tulis",
      description: "Discover our premium collection of handcrafted batik tulis, featuring traditional Indonesian motifs with modern sophistication.",
      accent: "from-amber-500/20 to-orange-500/20",
    },
    {
      id: "ready-to-wear",
      name: "Batik Ready to Wear",
      subtitle: "Modern Convenience",
      image: dobbyImage,
      link: "/ready-to-wear",
      description: "Explore our contemporary ready-to-wear batik collection, perfect for modern lifestyle and everyday elegance.",
      accent: "from-blue-500/20 to-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <PromoBar />
      <Header />
      <main className="min-h-[calc(100vh-200px)]">
        {/* Brand Selection Section - Full Width Split Layout */}
        <section className="flex flex-col md:flex-row h-[calc(100vh-200px)] md:h-screen relative">
          {brands.map((brand, index) => (
            <Link
              key={brand.id}
              to={brand.link}
              className={cn(
                "group relative overflow-hidden w-full md:w-1/2 h-1/2 md:h-full cursor-pointer",
                "transition-all duration-700 ease-out",
                "animate-fade-in-up",
                "hover:z-20"
              )}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Background Pattern Overlay */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-br",
                brand.accent,
                "z-10 mix-blend-overlay"
              )} />

              {/* Brand Image with Parallax Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover",
                    "transition-transform duration-[1000ms] ease-out",
                    "group-hover:scale-110",
                    "scale-100"
                  )}
                  loading="eager"
                />
              </div>
              
              {/* Multi-layer Gradient Overlay for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 group-hover:from-black/98 group-hover:via-black/70 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
              </div>
              
              {/* Content with Enhanced Typography */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12 xl:p-16 z-20">
                <div className="space-y-3 md:space-y-4 lg:space-y-5 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                  {/* Subtitle with Icon */}
                  <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-accent animate-pulse" />
                    <p className="text-white/80 text-xs md:text-sm lg:text-base font-medium uppercase tracking-[0.2em]">
                      {brand.subtitle}
                    </p>
                  </div>
                  
                  {/* Brand Name with Glow Effect */}
                  <h3 className={cn(
                    "text-white text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2",
                    "drop-shadow-2xl",
                    "transform group-hover:scale-105 transition-transform duration-500"
                  )}>
                    {brand.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/85 text-sm md:text-base lg:text-lg line-clamp-2 max-w-lg leading-relaxed">
                    {brand.description}
                  </p>
                  
                  {/* CTA Button with Enhanced Animation */}
                  <div className="flex items-center gap-3 mt-6 md:mt-8 group-hover:gap-5 transition-all duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full group-hover:bg-accent/40 transition-all duration-500" />
                      <div className="relative flex items-center gap-2 text-accent font-semibold text-base md:text-lg lg:text-xl">
                        <span className="relative z-10">Explore Collection</span>
                        <ArrowRight className={cn(
                          "h-5 w-5 md:h-6 md:w-6 transition-transform duration-500",
                          "group-hover:translate-x-2"
                        )} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated Border on Hover */}
              <div className={cn(
                "absolute inset-0 border-2 border-transparent",
                "group-hover:border-accent/40 transition-all duration-500",
                "group-hover:shadow-[0_0_40px_rgba(217,119,6,0.3)]"
              )} />

              {/* Shine Effect on Hover */}
              <div className={cn(
                "absolute inset-0 -translate-x-full group-hover:translate-x-full",
                "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                "transition-transform duration-1000 ease-in-out",
                "pointer-events-none"
              )} />
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

