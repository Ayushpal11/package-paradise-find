import { Calendar, Phone, Mail, ExternalLink, MapPin, Tag, Globe, Facebook, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FetchedTour } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export const FetchedTourCard = ({ tour }: { tour: FetchedTour }) => {
  const navigate = useNavigate();
  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => navigate(`/tour/${tour.id}`)}>
      <div className="relative h-40">
        <img
          src={tour.image_url || "/placeholder.svg"}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge className="absolute top-3 right-3 bg-primary">
          {tour.source_platform?.toUpperCase() || 'AD'}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-1">{tour.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{tour.destination}</span>
            {tour.origin && <span> • From {tour.origin}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {tour.currency || '₹'}{tour.price?.toLocaleString() || 'Contact for price'}
          </div>
          <Badge variant="secondary" className="text-xs">
            {tour.duration || 'Flexible'}
          </Badge>
        </div>

        {tour.tour_start_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(tour.tour_start_date).toLocaleDateString()} 
              {tour.tour_end_date && ` - ${new Date(tour.tour_end_date).toLocaleDateString()}`}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tour.amenities?.slice(0, 4).map((amenity, i) => (
            <Badge key={i} variant="outline" className="text-[10px] py-0 px-2">
              {amenity}
            </Badge>
          ))}
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getPlatformIcon(tour.source_platform)}
              <span className="font-medium">{tour.vendor_name}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {tour.contact_phone && (
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" asChild>
                <a href={`tel:${tour.contact_phone}`}>
                  <Phone className="mr-1 h-3 w-3" />
                  Call
                </a>
              </Button>
            )}
            <Button size="sm" className="flex-1 h-8 text-xs" asChild>
              <a href={tour.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Details
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
