import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageCard } from "@/components/PackageCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

const mockPackages = [
  {
    id: "1",
    title: "Bali Paradise Escape",
    destination: "Bali, Indonesia",
    duration: "5N/6D",
    price: 45000,
    currency: "₹",
    vendor: "TravelTriangle",
    rating: 4.5,
    hotelStars: 4,
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: true,
      sightseeing: true,
    },
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    refundable: true,
    isOTA: true,
  },
  {
    id: "2",
    title: "Maldives Honeymoon Special",
    destination: "Maldives",
    duration: "7N/8D",
    price: 89000,
    currency: "₹",
    vendor: "Local Paradise Tours",
    rating: 4.8,
    hotelStars: 5,
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: true,
      sightseeing: false,
    },
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    refundable: false,
    isOTA: false,
  },
  {
    id: "3",
    title: "Dubai Luxury Experience",
    destination: "Dubai, UAE",
    duration: "5N/6D",
    price: 55000,
    currency: "₹",
    vendor: "MakeMyTrip",
    rating: 4.6,
    hotelStars: 5,
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: false,
      sightseeing: true,
    },
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    refundable: true,
    isOTA: true,
  },
  {
    id: "4",
    title: "Thailand Adventure Tour",
    destination: "Bangkok & Phuket",
    duration: "6N/7D",
    price: 42000,
    currency: "₹",
    vendor: "Yatra",
    rating: 4.3,
    hotelStars: 3,
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: true,
      sightseeing: true,
    },
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    refundable: false,
    isOTA: true,
  },
  {
    id: "5",
    title: "Singapore Family Delight",
    destination: "Singapore",
    duration: "4N/5D",
    price: 38000,
    currency: "₹",
    vendor: "Local Travel Experts",
    rating: 4.4,
    hotelStars: 4,
    inclusions: {
      flights: true,
      hotels: true,
      transfers: true,
      meals: false,
      sightseeing: true,
    },
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",
    refundable: true,
    isOTA: false,
  },
];

const Results = () => {
  const location = useLocation();
  const searchData = location.state;
  const [sortBy, setSortBy] = useState("price");

  const otaPackages = mockPackages.filter((pkg) => pkg.isOTA);
  const localPackages = mockPackages.filter((pkg) => !pkg.isOTA);

  const bestPackage = mockPackages[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">
            Packages to {searchData?.destination || "Your Destination"}
          </h1>
          <p className="text-white/90">
            {searchData?.travellers || "2"} Travellers • {searchData?.startDate} to{" "}
            {searchData?.endDate}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {bestPackage && (
          <div className="mb-8 bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-6 border-2 border-accent">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-bold">Best Recommended Package</h2>
              <Badge className="bg-accent">Top Pick</Badge>
            </div>
            <PackageCard {...bestPackage} />
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <FilterSidebar onFilterChange={(filters) => console.log(filters)} />
          </aside>

          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {mockPackages.length} packages found
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="ota" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="ota">From OTAs ({otaPackages.length})</TabsTrigger>
                <TabsTrigger value="local">From Local Agents ({localPackages.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="ota" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {otaPackages.map((pkg) => (
                    <PackageCard key={pkg.id} {...pkg} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="local" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {localPackages.map((pkg) => (
                    <PackageCard key={pkg.id} {...pkg} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Results;
