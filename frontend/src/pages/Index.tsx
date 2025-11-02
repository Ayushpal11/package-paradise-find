import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Shield, Award, Globe } from "lucide-react";
import heroImage from "@/assets/hero-beach.jpg";

const Index = () => {
  const popularDestinations = [
    { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4", packages: 45 },
    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", packages: 38 },
    { name: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8", packages: 29 },
    { name: "Thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a", packages: 52 },
  ];

  return (
    <div className="min-h-screen">
      <section
        className="relative min-h-[600px] flex items-center justify-center bg-gradient-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 102, 153, 0.85) 0%, rgba(0, 153, 204, 0.75) 50%, rgba(51, 153, 204, 0.7) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Find Your Perfect Travel Package
            </h1>
            <p className="text-xl text-white/95 max-w-2xl mx-auto drop-shadow">
              Compare packages from top OTAs and local vendors all in one place
            </p>
          </div>

          <SearchBar />

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Globe,
                title: "Compare Everywhere",
                desc: "All packages in one search",
              },
              {
                icon: Shield,
                title: "Trusted Vendors",
                desc: "Verified OTAs & local agents",
              },
              {
                icon: Award,
                title: "Best Value",
                desc: "Find top-rated packages",
              },
              {
                icon: Plane,
                title: "Complete Packages",
                desc: "Flights + Hotels + More",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="bg-white/95 backdrop-blur border-0">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Destinations</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {popularDestinations.map((dest) => (
              <Card key={dest.name} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{dest.name}</h3>
                    <p className="text-sm">{dest.packages} packages</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Destinations
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search and compare travel packages from multiple sources. Find the best deals for your
            next adventure.
          </p>
          <Button size="lg">
            Search Packages Now
          </Button>
        </div>
      </section>

      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">About Us</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for comparing travel packages across India.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>How it works</li>
                <li>Popular destinations</li>
                <li>Vendor partners</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help center</li>
                <li>Contact us</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Terms of service</li>
                <li>Privacy policy</li>
                <li>Cookie policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Travel Package Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
