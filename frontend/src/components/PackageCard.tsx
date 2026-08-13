import { Star, Plane, Hotel, Car, UtensilsCrossed, MapPin, Tag, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PackageCardProps {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  currency: string;
  vendor: string;
  vendorLogo?: string;
  rating: number;
  hotelStars: number;
  inclusions: {
    flights: boolean;
    hotels: boolean;
    transfers: boolean;
    meals: boolean;
    sightseeing: boolean;
  };
  image: string;
  refundable: boolean;
  isOTA?: boolean;
  index?: number;
  priceDrop?: number; // percentage drop
  originalPrice?: number;
}

export const PackageCard = ({
  id,
  title,
  destination,
  duration,
  price,
  currency,
  vendor,
  rating,
  hotelStars,
  inclusions,
  image,
  refundable,
  isOTA,
  index = 0,
  priceDrop,
  originalPrice,
}: PackageCardProps) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: isMobile ? 0 : -5 }}
      className={isMobile ? "active:scale-[0.98] transition-transform" : ""}
    >
      <Card
        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-none shadow-md bg-white/80 backdrop-blur-sm"
        onClick={() => navigate(`/package/${id}`, { state: { isOTA } })}
        role="button"
        tabIndex={0}
        aria-label={`View ${title} package details`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/package/${id}`, { state: { isOTA } });
          }
        }}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {refundable && (
              <Badge className="bg-accent text-accent-foreground shadow-sm">
                Refundable
              </Badge>
            )}
            {priceDrop && priceDrop > 0 && (
              <Badge className="bg-red-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                <TrendingDown className="h-3 w-3" />
                -{priceDrop}%
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{destination}</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              {originalPrice && originalPrice > price && (
                <div className="text-xs text-muted-foreground line-through decoration-red-400 decoration-2">
                  {currency}{originalPrice.toLocaleString()}
                </div>
              )}
              <div className="text-2xl font-bold text-primary">
                {currency}{price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">per person</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <div className="flex">
                {Array.from({ length: hotelStars }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {duration}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {inclusions.flights && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Plane className="h-3.5 w-3.5 text-ocean" />
                <span>Flights</span>
              </div>
            )}
            {inclusions.hotels && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hotel className="h-3.5 w-3.5 text-ocean" />
                <span>Hotels</span>
              </div>
            )}
            {inclusions.transfers && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Car className="h-3.5 w-3.5 text-ocean" />
                <span>Transfers</span>
              </div>
            )}
            {inclusions.meals && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <UtensilsCrossed className="h-3.5 w-3.5 text-ocean" />
                <span>Meals</span>
              </div>
            )}
            {inclusions.sightseeing && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5 text-ocean" />
                <span>Tours</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground truncate">
              by <span className="font-medium text-foreground">{vendor}</span>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/package/${id}`, { state: { isOTA } });
              }}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
