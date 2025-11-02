import { useParams, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";
import { EnquiryForm } from "@/components/EnquiryForm";

const PackageDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const isOTA = location.state?.isOTA;
  const [showEnquiry, setShowEnquiry] = useState(false);

  const packageData = {
    title: "Bali Paradise Escape",
    destination: "Bali, Indonesia",
    duration: "5N/6D",
    price: 45000,
    currency: "₹",
    vendor: "TravelTriangle",
    rating: 4.5,
    hotelStars: 4,
    reviews: 1234,
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
    ],
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: true,
      sightseeing: true,
    },
    highlights: [
      "Visit Tanah Lot Temple at sunset",
      "Water sports at Tanjung Benoa Beach",
      "Traditional Balinese dance performance",
      "Ubud Monkey Forest tour",
      "Rice terrace exploration",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Bali",
        description: "Airport pickup and transfer to hotel. Evening at leisure. Welcome dinner included.",
      },
      {
        day: 2,
        title: "Ubud Cultural Tour",
        description: "Visit Ubud Monkey Forest, rice terraces, and art markets. Traditional lunch included.",
      },
      {
        day: 3,
        title: "Water Sports & Beach Day",
        description: "Full day at Tanjung Benoa with water sports activities. Beach sunset at Tanah Lot Temple.",
      },
      {
        day: 4,
        title: "Island Exploration",
        description: "Visit Besakih Temple, Tirta Gangga water palace, and local villages.",
      },
      {
        day: 5,
        title: "Leisure Day",
        description: "Free day for shopping, spa, or optional activities. Farewell dinner in the evening.",
      },
      {
        day: 6,
        title: "Departure",
        description: "Check out from hotel. Transfer to airport for your return flight.",
      },
    ],
    hotelInfo: {
      name: "Grand Bali Beach Resort",
      rating: 4,
      amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Gym", "Beach Access"],
    },
    flightInfo: {
      airline: "Air India",
      from: "Delhi (DEL)",
      to: "Bali (DPS)",
      class: "Economy",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[400px] bg-gradient-hero">
        <img
          src={packageData.images[0]}
          alt={packageData.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Badge className="mb-2 bg-accent text-accent-foreground">
              {isOTA ? "OTA Package" : "Local Vendor"}
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-2">{packageData.title}</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                <span>{packageData.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>
                  {packageData.rating} ({packageData.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 overflow-x-auto">
              {packageData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="h-32 w-48 object-cover rounded-lg"
                />
              ))}
            </div>

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
                      <div className="flex items-center gap-2">
                        <Plane className="h-5 w-5 text-ocean" />
                        <span>Return Flights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hotel className="h-5 w-5 text-ocean" />
                        <span>{packageData.hotelStars}★ Hotel Stay</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-ocean" />
                        <span>Airport Transfers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5 text-ocean" />
                        <span>Meals Included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {packageData.itinerary.map((day) => (
                      <div key={day.day} className="border-l-2 border-primary pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Day {day.day}</Badge>
                          <h4 className="font-semibold">{day.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hotel" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{packageData.hotelInfo.name}</h3>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: packageData.hotelInfo.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {packageData.hotelInfo.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
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
                        <strong>Payment Terms:</strong> 30% advance payment required at booking. Balance to be
                        paid 15 days before travel.
                      </p>
                      <p>
                        <strong>ID Requirements:</strong> Valid passport with minimum 6 months validity
                        required.
                      </p>
                      <p>
                        <strong>Visa:</strong> Visa on arrival available for Indian passport holders.
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

                {isOTA ? (
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
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>info@{packageData.vendor.toLowerCase().replace(/\s/g, "")}.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showEnquiry && (
        <EnquiryForm
          packageTitle={packageData.title}
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </div>
  );
};

export default PackageDetail;
