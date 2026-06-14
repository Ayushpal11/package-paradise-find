import { EnquiryForm } from "@/components/EnquiryForm";
import { packageApi, Package } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    window.scrollTo(0, 0);
  }, []);

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
        <p className="text-muted-foreground animate-pulse">Loading adventure details...</p>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="relative h-[450px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img
            src={images[0] || "/placeholder.svg"}
            alt={packageData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/40" />
        </motion.div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 bg-accent/90 backdrop-blur-md text-accent-foreground px-4 py-1">
                {packageData.isOTA ? "Featured OTA Deal" : "Verified Local Expert"}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                {packageData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="font-medium">{packageData.destination}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{packageData.rating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock className="h-5 w-5 text-sky" />
                  <span className="font-medium">{packageData.duration}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {images.length > 1 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              >
                {images.map((img, idx) => (
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    key={idx}
                    src={img || "/placeholder.svg"}
                    alt={`Gallery ${idx + 1}`}
                    className="h-40 min-w-[280px] object-cover rounded-2xl shadow-md cursor-zoom-in transition-all"
                  />
                ))}
              </motion.div>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-4 p-1 bg-muted/50 rounded-xl mb-8">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="itinerary" className="rounded-lg">Itinerary</TabsTrigger>
                <TabsTrigger value="hotel" className="rounded-lg">Accommodation</TabsTrigger>
                <TabsTrigger value="terms" className="rounded-lg">Important</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="overview" className="space-y-8 outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-sm bg-slate-50/50">
                      <CardContent className="p-8">
                        <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                          <CheckCircle2 className="text-primary h-6 w-6" />
                          Experience Inclusions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {[
                            { show: packageData.inclusions.flights, icon: Plane, label: "Return Airfare included", sub: `From ${packageData.origin}` },
                            { show: packageData.inclusions.hotels, icon: Hotel, label: `${packageData.hotelStars}★ Premium Stay`, sub: "Verified property" },
                            { show: packageData.inclusions.transfers, icon: Car, label: "Private Transfers", sub: "Point to point" },
                            { show: packageData.inclusions.meals, icon: UtensilsCrossed, label: "Daily Meals", sub: "Breakfast & Dinner" },
                            { show: packageData.inclusions.sightseeing, icon: Tag, label: "Guided Tours", sub: "All entry fees paid" },
                          ].filter(inc => inc.show).map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-bold text-sm">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.sub}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {packageData.highlights && packageData.highlights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card className="border-none shadow-sm overflow-hidden">
                        <div className="h-2 bg-accent" />
                        <CardContent className="p-8">
                          <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                            <Sparkles className="text-accent h-6 w-6" />
                            Trip Highlights
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {packageData.highlights.map((highlight, idx) => (
                              <div key={idx} className="flex items-start gap-3 group">
                                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                  <div className="w-2 h-2 rounded-full bg-accent" />
                                </div>
                                <span className="text-sm font-medium">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="itinerary" className="outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {packageData.itinerary && packageData.itinerary.length > 0 ? (
                      packageData.itinerary.map((day, idx) => (
                        <div key={idx} className="relative pl-10 pb-8 border-l-2 border-slate-200 last:border-0 last:pb-0">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm" />
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-primary/10 text-primary border-none font-bold">DAY {day.day}</Badge>
                            <h4 className="font-bold text-xl">{day.title}</h4>
                          </div>
                          <p className="text-muted-foreground leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                            {day.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-muted-foreground">Detailed day-wise itinerary is being updated.</p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="sticky top-24"
            >
              <Card className="border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-primary p-1 text-center text-[10px] text-white/50 font-bold tracking-widest uppercase">
                  Best price guaranteed
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-black text-primary flex items-start gap-1">
                        <span className="text-xl mt-1.5">{packageData.currency}</span>
                        {packageData.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">TOTAL PER PERSON</div>
                    </div>
                    {packageData.refundable && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Refundable
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Duration</div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {packageData.duration}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Travellers</div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Min 2 Pax
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {packageData.isOTA ? (
                      <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" size="lg">
                        <ExternalLink className="mr-2 h-5 w-5" />
                        Visit {packageData.vendor}
                      </Button>
                    ) : (
                      <Button className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" size="lg" onClick={() => setShowEnquiry(true)}>
                        Enquire Now
                      </Button>
                    )}
                    
                    <p className="text-[10px] text-center text-muted-foreground px-4">
                      By clicking above, you agree to connect with {packageData.vendor} for booking enquiries.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xl">
                        {packageData.vendor[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase">Managed By</div>
                        <div className="font-bold text-sm">{packageData.vendor}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(packageData.rating) ? "fill-primary text-primary" : "text-slate-200"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 flex items-center justify-center gap-8 text-muted-foreground/60">
                <Shield className="h-8 w-8" />
                <Award className="h-8 w-8" />
                <Globe className="h-8 w-8" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEnquiry && id && (
          <EnquiryForm
            packageId={id}
            packageTitle={packageData.title}
            onClose={() => setShowEnquiry(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PackageDetail;
