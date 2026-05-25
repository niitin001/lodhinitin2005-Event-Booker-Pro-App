import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Camera, Users, Star, MapPin, ArrowRight, Heart } from "lucide-react";

const STATS = [
  { icon: Camera, label: "Events Covered", value: "15,000+" },
  { icon: Users, label: "Verified Vendors", value: "2,400+" },
  { icon: MapPin, label: "Cities Covered", value: "80+" },
  { icon: Star, label: "Avg. Rating", value: "4.8 / 5" },
];

const TEAM = [
  { name: "Aditya Verma", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "Neha Kapoor", role: "Head of Vendor Relations", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80" },
  { name: "Karan Mehta", role: "Head of Technology", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
  { name: "Priyanka Joshi", role: "Head of Customer Success", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80" },
];

export default function About() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Heart className="h-10 w-10 mx-auto mb-4 opacity-80" />
              <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-4">About EventShooter</h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
                We are India's fastest-growing event services marketplace — connecting people with the best photographers, decorators, DJs, caterers, and creative professionals.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-background border-b">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary opacity-80" />
                  <p className="text-3xl font-bold font-serif">{value}</p>
                  <p className="text-muted-foreground text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-muted/10">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 text-lg">
              EventShooter was founded in 2021 by a team of event professionals who were tired of the frustrating, fragmented process of finding and booking quality event vendors in India.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We have all been there — spending weeks searching for the right photographer, dealing with unresponsive vendors, getting surprised by hidden costs, and worrying if the person we booked would actually deliver. We built EventShooter to fix all of that.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we are proud to serve customers across 80+ cities in India, with a growing network of 2,400+ verified vendors covering weddings, corporate events, fashion shows, parties, drone shoots, and content creation.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-background">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-10">Meet the Team</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TEAM.map((member) => (
                <Card key={member.name} className="overflow-hidden text-center">
                  <div className="aspect-square overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-muted/30 text-center px-4">
          <h2 className="font-serif text-2xl font-bold mb-3">Ready to book your next event?</h2>
          <p className="text-muted-foreground mb-6">Join thousands of happy customers who trust EventShooter for their most important moments.</p>
          <Button size="lg" onClick={() => setLocation("/book")}>Book Now — Free <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
