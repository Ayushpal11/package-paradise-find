import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Shield, Award, Globe, Sparkles, MapPin, ArrowRight, Loader2, Clock, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-beach.jpg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { tourApi, FetchedTour } from "@/lib/api";
import { FetchedTourCard } from "@/components/FetchedTourCard";

const Index = () => {
  const [upcomingTours, setUpcomingTours] = useState<FetchedTour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);

  useEffect(() => {
    const fetchHomeTours = async () => {
      setLoadingTours(true);
      try {
        // 1. Try to fetch existing tours from DB
        const res = await tourApi.getRecent({ limit: 12 });
        
        if (res.success && res.tours.length > 0) {
          setUpcomingTours(res.tours);
          setLoadingTours(false);
        } else {
          // 2. If DB is empty, trigger a global live search
          console.log("No tours in cache, triggering live discovery...");
          const liveRes = await tourApi.fetchInternet({ 
            destination: "India best group tours 2026",
            fetchDetails: true 
          });
          if (liveRes.success) {
            setUpcomingTours(liveRes.tours);
          }
        }
      } catch (err) {
        console.error("Failed to fetch home tours:", err);
      } finally {
        setLoadingTours(false);
      }
    };
    fetchHomeTours();
  }, []);

  const popularDestinations = [
    { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4", packages: 45 },
    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", packages: 38 },
    { name: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8", packages: 29 },
    { name: "Thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a", packages: 52 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 shadow-xl"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span>AI-Powered Travel Comparison</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              Your Paradise <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean to-accent">Awaits</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Compare thousands of packages from top OTAs and local agents. 
              Find your next adventure with the help of AI.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative group max-w-5xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-ocean to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <SearchBar />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: "Global Search", desc: "Compare everywhere" },
              { icon: Shield, title: "Trusted Sources", desc: "Verified vendors" },
              { icon: Award, title: "Best Value", desc: "Top-rated deals" },
              { icon: Plane, title: "Full Packages", desc: "All-inclusive" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="h-10 w-10 text-accent mx-auto mb-3" />
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-xs text-white/60">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">Popular Destinations</h2>
              <p className="text-muted-foreground">Handpicked locations just for you</p>
            </motion.div>
            <Button variant="ghost" className="hidden md:flex items-center gap-2 group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {popularDestinations.map((dest, idx) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden group cursor-pointer border-none shadow-lg">
                  <div className="relative h-64">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <MapPin className="h-4 w-4" />
                        <span>{dest.packages} packages</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tours (Automatically Fetched) */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Clock className="h-5 w-5" />
                <span>REAL-TIME UPDATES</span>
              </div>
              <h2 className="text-4xl font-bold">Upcoming Group Tours</h2>
              <p className="text-muted-foreground mt-2">Latest fixed departures found across social media and ads</p>
            </motion.div>
            
            <Button variant="outline" className="rounded-full border-primary/20 hover:border-primary/50">
              Explore All Tours
            </Button>
          </div>

          {loadingTours ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <p className="text-muted-foreground animate-pulse">Scanning the web for latest deals...</p>
            </div>
          ) : upcomingTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingTours.map((tour, idx) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <FetchedTourCard tour={tour} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No upcoming tours found yet</h3>
              <p className="text-slate-400 mt-1">Try searching for a destination to trigger a fresh scan!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" 
        />
        
        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of travelers who use our AI-powered comparison tool to find 
              the best value for their dream vacations.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-bold rounded-full shadow-2xl hover:scale-105 transition-transform">
              Search Packages Now
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-background py-16 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">P</div>
                Package Paradise
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted platform for comparing travel packages across India. 
                Using the latest AI technology to find you the perfect trip.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">How it works</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Popular destinations</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Vendor partners</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Help center</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contact us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Social</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                {/* Add more icons here */}
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-sm text-muted-foreground">
            © 2025 Travel Package Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
