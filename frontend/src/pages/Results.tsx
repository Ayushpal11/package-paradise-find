import { useState, useEffect, useCallback } from "react";
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
import { Award, Loader2, RefreshCw } from "lucide-react";
import { packageApi, Package } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Results = () => {
  const location = useLocation();
  const searchData = location.state;
  const [sortBy, setSortBy] = useState("price");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  // Fetch packages function
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        destination: searchData?.destination,
        origin: searchData?.origin,
        sortBy,
      };

      // Apply filters
      if (filters.priceRange) {
        params.priceMin = filters.priceRange[0];
        params.priceMax = filters.priceRange[1];
      }
      if (filters.hotelStars && filters.hotelStars.length > 0) {
        params.hotelStars = filters.hotelStars;
      }
      if (filters.meals) {
        params.meals = true;
      }
      if (filters.transfers) {
        params.transfers = true;
      }
      if (filters.refundable) {
        params.refundable = true;
      }
      if (filters.nights && filters.nights.length > 0) {
        params.nights = filters.nights;
      }

      const data = await packageApi.search(params);
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchData, sortBy, filters, toast]);

  // Fetch packages on component mount and when search/filters change
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Auto-refresh packages every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPackages();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchPackages]);

  const otaPackages = packages.filter((pkg) => pkg.isOTA);
  const localPackages = packages.filter((pkg) => !pkg.isOTA);
  const bestPackage = packages[0];

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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                <FilterSidebar onFilterChange={(newFilters) => setFilters(newFilters)} />
              </aside>

              <main className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {packages.length} packages found
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAutoRefresh(!autoRefresh);
                        toast({
                          title: autoRefresh ? "Auto-refresh disabled" : "Auto-refresh enabled",
                          description: autoRefresh
                            ? "Packages will no longer update automatically"
                            : "Packages will update every 30 seconds",
                        });
                      }}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                      {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchPackages}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh Now
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                </div>

                {packages.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-lg text-muted-foreground">
                      No packages found. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="ota" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="ota">From OTAs ({otaPackages.length})</TabsTrigger>
                      <TabsTrigger value="local">From Local Agents ({localPackages.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ota" className="mt-6">
                      {otaPackages.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">No OTA packages found.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {otaPackages.map((pkg) => (
                            <PackageCard key={pkg.id} {...pkg} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="local" className="mt-6">
                      {localPackages.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">No local vendor packages found.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {localPackages.map((pkg) => (
                            <PackageCard key={pkg.id} {...pkg} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
