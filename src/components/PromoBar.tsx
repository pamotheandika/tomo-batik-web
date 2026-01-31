import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const promos = [
  {
    text: "New Customers Get 20% Off with code: GETSTARTED20",
    link: "/register",
    isClickable: true,
  },
  {
    text: "Loyal Customers Get 15% OFF with code: MANDALASIAN",
    link: null,
    isClickable: false,
  },
];

const PromoBar = () => {
  const [currentPromo, setCurrentPromo] = useState(0);

  const nextPromo = () => {
    setCurrentPromo((prev) => (prev + 1) % promos.length);
  };

  const prevPromo = () => {
    setCurrentPromo((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const currentPromoData = promos[currentPromo];

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-10 gap-4">
          <button
            onClick={prevPromo}
            className="hover:opacity-70 transition-opacity"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {currentPromoData.isClickable && currentPromoData.link ? (
            <Link 
              to={currentPromoData.link}
              className="text-xs md:text-sm font-medium text-center hover:underline cursor-pointer"
            >
              {currentPromoData.text}
            </Link>
          ) : (
            <p className="text-xs md:text-sm font-medium text-center">
              {currentPromoData.text}
            </p>
          )}
          
          <button
            onClick={nextPromo}
            className="hover:opacity-70 transition-opacity"
            aria-label="Next promotion"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBar;
