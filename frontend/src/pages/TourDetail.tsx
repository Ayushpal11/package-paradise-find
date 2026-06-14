import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  ExternalLink,
  Phone,
  CheckCircle2,
  Loader2,
  Globe,
  Facebook,
  Instagram,
  Sparkles,
  ArrowLeft,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { tourApi, FetchedTour } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState<FetchedTour | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tourApi.getById(id);
        setTour(data);
      } catch (error) {
        console.error("Error fetching tour:", error);
        toast({
          title: "Error",
          description: "Failed to load tour details.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
        <p className="text-muted-foreground animate-pulse">Deep-scanning tour details...</p>
      </div>
    );
  }

  if (!tour) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background">
      <div className="relative h-[450px] overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2 }} className="absolute inset-0">
          <img src={tour.image_url || "/placeholder.svg"} alt={tour.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/50" />
        </motion.div>
        
        <div className="absolute top-6 left-6 z-20">
          <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Badge className="mb-4 bg-primary text-white px-4 py-1">
                LIVE FROM {tour.source_platform?.toUpperCase()}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {tour.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="font-medium">{tour.destination}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="h-5 w-5 text-sky" />
                  <span className="font-medium">{tour.duration || 'Flexible Dates'}</span>
                </div>
                {tour.tour_start_date && (
                  <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Calendar className="h-5 w-5 text-orange-400" />
                    <span className="font-medium">{new Date(tour.tour_start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-3 p-1 bg-muted/50 rounded-xl mb-8">
                <TabsTrigger value="details">Tour Details</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="about">About Vendor</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="details" className="space-y-8 outline-none">
                  <Card className="border-none shadow-sm bg-slate-50/50">
                    <CardContent className="p-8">
                      <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                        <Sparkles className="text-primary h-6 w-6" />
                        Inclusions & Amenities
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {tour.amenities?.map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="px-4 py-1.5 text-sm bg-white border border-slate-200">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-8 space-y-4">
                        <h4 className="font-bold text-lg">Key Highlights</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {tour.highlights?.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="itinerary" className="outline-none">
                  <div className="space-y-6">
                    {tour.itinerary && Array.isArray(tour.itinerary) ? (
                      tour.itinerary.map((day, idx) => (
                        <div key={idx} className="relative pl-10 pb-8 border-l-2 border-slate-200 last:border-0 last:pb-0">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm" />
                          <h4 className="font-bold text-xl mb-2">Day {day.day || idx + 1}</h4>
                          <p className="text-muted-foreground leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                            {day.description}
                          </p>
                        </div>
                      ))
                    ) : tour.full_plan ? (
                      <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                        <h4 className="font-bold text-xl mb-4">Tour Plan</h4>
                        <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                          {tour.full_plan}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-muted-foreground">Itinerary details can be found on the original post.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="about" className="outline-none">
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                          {tour.vendor_name?.[0]}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{tour.vendor_name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {getPlatformIcon(tour.source_platform)}
                            <span>Source: {tour.source_platform}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        This tour was discovered via automated scanning of {tour.source_platform} travel ads and listings. 
                        We recommend contacting the vendor directly to verify availability and latest pricing.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="sticky top-24">
              <Card className="border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-primary p-1 text-center text-[10px] text-white font-bold tracking-widest uppercase">
                  Internet Discovery
                </div>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <div className="text-4xl font-black text-primary flex items-start gap-1">
                      <span className="text-xl mt-1.5">{tour.currency}</span>
                      {tour.price?.toLocaleString() || "Ask Vendor"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">ESTIMATED PRICE</div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {tour.contact_phone && (
                      <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700" size="lg" asChild>
                        <a href={`tel:${tour.contact_phone}`}>
                          <Phone className="mr-2 h-5 w-5" /> Call Operator
                        </a>
                      </Button>
                    )}
                    {tour.contact_whatsapp || tour.contact_phone ? (
                      <Button variant="outline" className="w-full h-14 text-lg font-bold border-green-200 text-green-700 hover:bg-green-50" size="lg" asChild>
                        <a href={`https://wa.me/${(tour.contact_whatsapp || tour.contact_phone)?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                          <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    <Button variant="ghost" className="w-full h-12 text-muted-foreground" asChild>
                      <a href={tour.source_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Original Post
                      </a>
                    </Button>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      *Prices found on internet listings may change. Please verify with the operator directly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TourDetail;
