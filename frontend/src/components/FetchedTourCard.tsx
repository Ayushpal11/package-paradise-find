import { Calendar, Phone, ExternalLink, MapPin, Globe, Facebook, Instagram } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FetchedTour } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

export const FetchedTourCard = ({ tour }: { tour: FetchedTour }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: isMobile ? 0 : -3 }}
      className={isMobile ? "active:scale-[0.98] transition-transform" : ""}
    >
      <Card
        className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
        onClick={() => navigate(`/tour/${tour.id}`)}
        role="button"
        tabIndex={0}
        aria-label={`View ${tour.title} tour details`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/tour/${tour.id}`);
          }
        }}
      >
        <div className="relative h-40">
          <img
            src={tour.image_url || "/placeholder.svg"}
            alt={tour.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className="absolute top-3 right-3 bg-primary shadow-sm">
            {tour.source_platform?.toUpperCase() || 'AD'}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{tour.title}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 flex-wrap">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{tour.destination}</span>
              {tour.origin && <> • From {tour.origin}</>}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xl font-bold text-primary">
              {tour.currency || '₹'}{tour.price?.toLocaleString() || 'Contact for price'}
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {tour.duration || 'Flexible'}
            </Badge>
          </div>

          {tour.tour_start_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {new Date(tour.tour_start_date).toLocaleDateString()}
                {tour.tour_end_date && ` - ${new Date(tour.tour_end_date).toLocaleDateString()}`}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {tour.amenities?.slice(0, 4).map((amenity, i) => (
              <Badge key={i} variant="outline" className="text-[10px] py-0 px-2 shrink-0">
                {amenity}
              </Badge>
            ))}
          </div>

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-2 shrink-0">
                {getPlatformIcon(tour.source_platform)}
                <span className="font-medium truncate">{tour.vendor_name}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {tour.contact_phone && (
                <Button size="sm" variant="outline" className={isMobile ? "flex-1 h-10 text-xs" : "flex-1 h-8 text-xs"} asChild>
                  <a href={`tel:${tour.contact_phone}`}>
                    <Phone className="mr-1 h-3.5 w-3.5" />
                    Call
                  </a>
                </Button>
              )}
              <Button size="sm" className={isMobile ? "flex-1 h-10 text-xs" : "flex-1 h-8 text-xs"} asChild>
                <a href={tour.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Details
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
