import cottonImage from "@/assets/collection-cotton.jpg";
import dobbyImage from "@/assets/collection-dobby.jpg";
import longsleeveImage from "@/assets/collection-longsleeve.jpg";
import { Card } from "./ui/card";

const collections = [
  {
    id: 1,
    title: "Premium Cotton Collection",
    image: cottonImage,
    alt: "Premium cotton batik collection with traditional Indonesian patterns",
  },
  {
    id: 2,
    title: "Long Sleeve - Dobby Collection",
    image: dobbyImage,
    alt: "Long sleeve dobby batik shirts with intricate woven patterns",
  },
  {
    id: 3,
    title: "Long Sleeve - Cotton Collection",
    image: longsleeveImage,
    alt: "Premium long sleeve cotton batik collection",
  },
];

const CollectionsGrid = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16">
          Collections
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div className="p-6 bg-card">
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-center group-hover:text-accent transition-colors duration-300">
                  {collection.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;
