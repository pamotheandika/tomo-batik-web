import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Premium batik fashion collection featuring elegant traditional Indonesian designs"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider mb-2">
            NEW
          </h1>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider">
            COLLECTION
          </h2>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
