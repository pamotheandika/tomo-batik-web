import Header from "@/components/Header";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import cottonImage from "@/assets/collection-cotton.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PromoBar />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Batik Tomo - Heritage meets modernity"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full min-h-[60vh] flex items-center">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-6 border-white/30 text-white/90 bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-2" />
                Sejak 2024
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
                About Us
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                Melestarikan warisan budaya Indonesia melalui sentuhan modern
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image */}
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={cottonImage}
                    alt="Batik craftsmanship"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative frame */}
                <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-accent/30 rounded-3xl -z-10" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
              </div>

              {/* Content */}
              <div className="space-y-8">
                <div>
                  <Badge variant="outline" className="mb-4">
                    <Heart className="h-3 w-3 mr-2" />
                    Cerita Kami
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                    Mempertahankan Warisan, Merangkul Modernitas
                  </h2>
                </div>
                
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Berdiri dari tahun 2024, <span className="text-foreground font-semibold">Batik Tomo</span> bekerja sama dengan para pengrajin lokal untuk mempertahankan warisan dan budaya Indonesia, mulai dari batik tulis hingga batik cap, menjadi karya yang sesuai dengan gaya modern.
                  </p>
                  <p>
                    Dengan menggabungkan tradisi dan sentuhan modern, Batik Tomo berupaya menghadirkan pengalaman mengenakan batik yang lebih <span className="text-foreground font-semibold">personal</span>, <span className="text-foreground font-semibold">berkualitas</span>, dan <span className="text-foreground font-semibold">berkelas</span>.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-accent mb-1">2024</div>
                    <div className="text-sm text-muted-foreground">Tahun Berdiri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-accent mb-1">100%</div>
                    <div className="text-sm text-muted-foreground">Asli Indonesia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-accent mb-1">♥</div>
                    <div className="text-sm text-muted-foreground">Dibuat dengan Cinta</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">Nilai Kami</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Mengapa Memilih Batik Tomo?
              </h2>
              <p className="text-muted-foreground text-lg">
                Kami berkomitmen untuk memberikan yang terbaik dalam setiap helai batik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Value 1 */}
              <div className="group p-8 rounded-3xl bg-background border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Kemitraan Pengrajin</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bekerja sama langsung dengan pengrajin lokal untuk menjaga kualitas dan keaslian setiap produk batik kami.
                </p>
              </div>

              {/* Value 2 */}
              <div className="group p-8 rounded-3xl bg-background border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Award className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Kualitas Premium</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Setiap produk melewati proses seleksi ketat untuk memastikan kualitas terbaik sampai ke tangan Anda.
                </p>
              </div>

              {/* Value 3 */}
              <div className="group p-8 rounded-3xl bg-background border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Desain Modern</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Menggabungkan motif tradisional dengan sentuhan kontemporer yang cocok untuk gaya hidup modern.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-12 md:p-16 text-center">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Mari Berkenalan Lebih Dekat
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8">
                  Temukan koleksi batik premium kami dan rasakan pengalaman mengenakan batik yang berbeda.
                </p>
                <a 
                  href="/catalog"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors"
                >
                  Jelajahi Koleksi
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

