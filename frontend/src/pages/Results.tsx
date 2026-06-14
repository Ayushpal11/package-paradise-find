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
import { packageApi, Package, aiApi, AITripPlanResponse, tourApi, FetchedTour } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Calendar as CalendarIcon, Map, Globe } from "lucide-react";
import { FetchedTourCard } from "@/components/FetchedTourCard";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Results = () => {
  const location = useLocation();
  const searchData = location.state;
  const [sortBy, setSortBy] = useState("price");
  const [packages, setPackages] = useState<Package[]>([]);
  const [fetchedTours, setFetchedTours] = useState<FetchedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTours, setFetchingTours] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // AI states
  const [aiPlanning, setAIPlanning] = useState(false);
  const [aiPlan, setAIPlan] = useState<AITripPlanResponse["data"] | null>(null);
  
  const { toast } = useToast();

  const handleAIPlan = async () => {
    setAIPlanning(true);
    try {
      // Calculate duration in days
      const start = new Date(searchData?.startDate);
      const end = new Date(searchData?.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const result = await aiApi.getPlan({
        destination: searchData?.destination,
        days: diffDays,
        startDate: searchData?.startDate,
        travellers: parseInt(searchData?.travellers) || 2,
        origin: searchData?.origin,
      });

      if (result.success) {
        setAIPlan(result.data);
      }
    } catch (error) {
      console.error("AI Planning Error:", error);
      toast({
        title: "AI Service Unavailable",
        description: "Could not generate trip plan. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setAIPlanning(false);
    }
  };

  // Fetch packages function
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        destination: searchData?.destination,
        origin: searchData?.origin,
        startDate: searchData?.startDate,
        endDate: searchData?.endDate,
        travellers: searchData?.travellers,
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

      // Also fetch internet tours
      setFetchingTours(true);
      const toursResult = await tourApi.getRecent({ destination: searchData?.destination });
      if (toursResult.success) {
        // Filter tours by dates if provided
        let tours = toursResult.tours;
        if (searchData?.startDate) {
          const searchStart = new Date(searchData.startDate);
          tours = tours.filter(t => {
            if (!t.tour_start_date) return true; // Keep flexible tours
            const tourStart = new Date(t.tour_start_date);
            return tourStart >= searchStart;
          });
        }
        
        // Sort by date (earliest first)
        tours.sort((a, b) => {
          if (!a.tour_start_date) return 1;
          if (!b.tour_start_date) return -1;
          return new Date(a.tour_start_date).getTime() - new Date(b.tour_start_date).getTime();
        });

        setFetchedTours(tours);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setFetchingTours(false);
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

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card border-2 border-primary/20 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden group"
                >
                  {/* Subtle glowing background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                        >
                          <Sparkles className="h-6 w-6 text-primary" />
                        </motion.div>
                        <h2 className="text-xl font-bold">AI Trip Planner</h2>
                        <Badge variant="outline" className="text-primary border-primary animate-pulse">Mistral AI</Badge>
                      </div>
                      <AnimatePresence mode="wait">
                        {!aiPlan && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <Button 
                              onClick={handleAIPlan} 
                              disabled={aiPlanning}
                              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              {aiPlanning ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Analyzing Data...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Generate Smart Plan
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {aiPlan ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.6, ease: "circOut" }}
                          className="space-y-6 overflow-hidden"
                        >
                          <div className="grid md:grid-cols-2 gap-6 pt-4">
                            <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="space-y-4"
                            >
                              <h3 className="font-bold flex items-center gap-2 text-primary">
                                <CalendarIcon className="h-5 w-5" />
                                Personalized Schedule
                              </h3>
                              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-6 rounded-xl border border-primary/5 shadow-inner">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {aiPlan.schedule}
                                </ReactMarkdown>
                              </div>
                            </motion.div>
                            <motion.div 
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="space-y-4"
                            >
                              <h3 className="font-bold flex items-center gap-2 text-primary">
                                <TrendingUp className="h-5 w-5" />
                                Cost Analysis & Budget
                              </h3>
                              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-6 rounded-xl border border-primary/5 shadow-inner">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {aiPlan.analysis}
                                </ReactMarkdown>
                              </div>
                            </motion.div>
                          </div>

                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4"
                          >
                            <h3 className="font-bold flex items-center gap-2 text-primary">
                              <Map className="h-5 w-5" />
                              Top Recommendations
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-6 rounded-xl border border-primary/5 shadow-inner">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {aiPlan.recommendations}
                              </ReactMarkdown>
                            </div>
                          </motion.div>

                          <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setAIPlan(null)} className="hover:bg-destructive hover:text-destructive-foreground transition-colors">
                              Close Plan
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground text-sm leading-relaxed"
                        >
                          Our AI will analyze thousands of data points from Google, social media, and travel ads to create a perfect itinerary and cost breakdown for you.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {packages.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-lg text-muted-foreground">
                      No packages found. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="ota" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 p-1 bg-muted/50 rounded-xl">
                      <TabsTrigger value="ota" className="rounded-lg transition-all">From OTAs ({otaPackages.length})</TabsTrigger>
                      <TabsTrigger value="local" className="rounded-lg transition-all">From Local Agents ({localPackages.length})</TabsTrigger>
                      <TabsTrigger value="internet" className="flex items-center gap-2 rounded-lg transition-all">
                        Internet Tours ({fetchedTours.length})
                        {fetchingTours && <Loader2 className="h-3 w-3 animate-spin" />}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ota" className="mt-6">
                      {otaPackages.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">No OTA packages found.</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {otaPackages.map((pkg, idx) => (
                            <PackageCard key={pkg.id} {...pkg} index={idx} />
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
                          {localPackages.map((pkg, idx) => (
                            <PackageCard key={pkg.id} {...pkg} index={idx} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="internet" className="mt-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          Live Discovery Results
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">14-Day Specials</Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">Live Scanned</Badge>
                        </div>
                      </div>

                      {fetchedTours.length === 0 ? (
                        <div className="text-center py-10 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                          <p className="text-muted-foreground mb-4">No matching planned tours found on social media or ads for these dates.</p>
                          <Button 
                            className="bg-primary shadow-lg shadow-primary/20"
                            onClick={async () => {
                              setFetchingTours(true);
                              try {
                                const res = await tourApi.fetchInternet({ 
                                  destination: `${searchData?.destination} 14 days`,
                                  origin: searchData?.origin,
                                  fetchDetails: true 
                                });
                                if (res.success) {
                                  setFetchedTours(res.tours);
                                  toast({ title: "Deep Scan Complete", description: `Found ${res.tours.length} new 14-day adventures!` });
                                }
                              } catch (err) {
                                toast({ title: "Deep Search failed", variant: "destructive", description: "Please check your Search API settings." });
                              } finally {
                                setFetchingTours(false);
                              }
                            }}
                          >
                            <Search className="mr-2 h-4 w-4" /> Trigger Global 14-Day Scan
                          </Button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {fetchedTours.map((tour) => (
                            <div key={tour.id} className="relative">
                              {(tour.duration?.includes('14D') || tour.full_plan?.includes('14 day') || tour.title.includes('14 Day')) && (
                                <div className="absolute -top-2 -right-2 z-20">
                                  <Badge className="bg-orange-500 text-white shadow-lg animate-bounce">
                                    14-DAY TOUR
                                  </Badge>
                                </div>
                              )}
                              <FetchedTourCard tour={tour} />
                            </div>
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
