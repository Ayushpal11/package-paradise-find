import { Star, Plane, Hotel, Car, UtensilsCrossed, MapPin, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
}: PackageCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {refundable && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            Refundable
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{destination}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-primary">
              {currency}{price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
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
            <div className="flex items-center gap-1 text-xs">
              <Plane className="h-3.5 w-3.5 text-ocean" />
              <span>Flights</span>
            </div>
          )}
          {inclusions.hotels && (
            <div className="flex items-center gap-1 text-xs">
              <Hotel className="h-3.5 w-3.5 text-ocean" />
              <span>Hotels</span>
            </div>
          )}
          {inclusions.transfers && (
            <div className="flex items-center gap-1 text-xs">
              <Car className="h-3.5 w-3.5 text-ocean" />
              <span>Transfers</span>
            </div>
          )}
          {inclusions.meals && (
            <div className="flex items-center gap-1 text-xs">
              <UtensilsCrossed className="h-3.5 w-3.5 text-ocean" />
              <span>Meals</span>
            </div>
          )}
          {inclusions.sightseeing && (
            <div className="flex items-center gap-1 text-xs">
              <Tag className="h-3.5 w-3.5 text-ocean" />
              <span>Tours</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            by <span className="font-medium text-foreground">{vendor}</span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/package/${id}`, { state: { isOTA } })}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
