import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Plane,
  Hotel,
  Car,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EnquiryForm } from "@/components/EnquiryForm";
import { packageApi, Package } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PackageDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isOTA = location.state?.isOTA;
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await packageApi.getById(id);
        setPackageData(data);
      } catch (error) {
        console.error("Error fetching package:", error);
        toast({
          title: "Error",
          description: "Failed to load package details. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Package not found</h2>
          <p className="text-muted-foreground mb-4">The package you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const images = packageData.images || [packageData.image];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[400px] bg-gradient-hero">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={packageData.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Badge className="mb-2 bg-accent text-accent-foreground">
              {packageData.isOTA ? "OTA Package" : "Local Vendor"}
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-2">{packageData.title}</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                <span>{packageData.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>{packageData.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img || "/placeholder.svg"}
                    alt={`Gallery ${idx + 1}`}
                    className="h-32 w-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="hotel">Hotel</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Package Inclusions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {packageData.inclusions.flights && (
                        <div className="flex items-center gap-2">
                          <Plane className="h-5 w-5 text-ocean" />
                          <span>Return Flights</span>
                        </div>
                      )}
                      {packageData.inclusions.hotels && (
                        <div className="flex items-center gap-2">
                          <Hotel className="h-5 w-5 text-ocean" />
                          <span>{packageData.hotelStars}★ Hotel Stay</span>
                        </div>
                      )}
                      {packageData.inclusions.transfers && (
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-ocean" />
                          <span>Airport Transfers</span>
                        </div>
                      )}
                      {packageData.inclusions.meals && (
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-5 w-5 text-ocean" />
                          <span>Meals Included</span>
                        </div>
                      )}
                      {packageData.inclusions.sightseeing && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-ocean" />
                          <span>Sightseeing Tours</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {packageData.highlights && packageData.highlights.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Highlights</h3>
                      <ul className="space-y-2">
                        {packageData.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-ocean mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {packageData.itinerary && packageData.itinerary.length > 0 ? (
                      packageData.itinerary.map((day, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Day {day.day}</Badge>
                            <h4 className="font-semibold">{day.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{day.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Itinerary details coming soon.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hotel" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {packageData.hotelInfo ? (
                      <>
                        <h3 className="font-semibold text-lg mb-2">{packageData.hotelInfo.name}</h3>
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: packageData.hotelInfo.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        {packageData.hotelInfo.amenities && packageData.hotelInfo.amenities.length > 0 && (
                          <>
                            <h4 className="font-medium mb-2">Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                              {packageData.hotelInfo.amenities.map((amenity, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Hotel details coming soon.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terms" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Terms & Conditions</h3>
                    <div className="space-y-3 text-sm">
                      <p>
                        <strong>Cancellation Policy:</strong> Cancellations made 30 days before travel: 25%
                        deduction. 15-29 days: 50% deduction. Less than 15 days: No refund.
                      </p>
                      <p>
                        <strong>Payment Terms:</strong> 30% advance payment required at booking. Balance to
                        be paid 15 days before travel.
                      </p>
                      <p>
                        <strong>ID Requirements:</strong> Valid passport with minimum 6 months validity
                        required.
                      </p>
                      <p>
                        <strong>Visa:</strong> Please check visa requirements for your destination.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {packageData.currency}
                    {packageData.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{packageData.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Min 2 travellers</span>
                  </div>
                </div>

                {packageData.isOTA ? (
                  <Button className="w-full" size="lg">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Visit {packageData.vendor}
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={() => setShowEnquiry(true)}>
                    Enquire Now
                  </Button>
                )}

                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm font-medium">Contact Vendor</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Contact vendor for details</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showEnquiry && id && (
        <EnquiryForm
          packageId={id}
          packageTitle={packageData.title}
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </div>
  );
};

export default PackageDetail;
