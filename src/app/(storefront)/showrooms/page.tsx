"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, ExternalLink, MapPin, Phone, Search } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const showrooms = [
  {
    id: "sr-1",
    name: "FSOW SoHo",
    city: "New York",
    address: "568 Broadway, SoHo, New York, NY 10012",
    hours: "Mon-Sat 10am-8pm, Sun 11am-6pm",
    phone: "(212) 555-0101",
    image: "https://picsum.photos/seed/showroom-nyc/600/400",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "sr-2",
    name: "FSOW West Hollywood",
    city: "Los Angeles",
    address: "8420 Melrose Ave, West Hollywood, CA 90069",
    hours: "Mon-Sat 10am-7pm, Sun 12pm-6pm",
    phone: "(310) 555-0202",
    image: "https://picsum.photos/seed/showroom-la/600/400",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "sr-3",
    name: "FSOW River North",
    city: "Chicago",
    address: "325 W Huron St, River North, Chicago, IL 60654",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm",
    phone: "(312) 555-0303",
    image: "https://picsum.photos/seed/showroom-chicago/600/400",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "sr-4",
    name: "FSOW Design District",
    city: "Miami",
    address: "3841 NE 2nd Ave, Design District, Miami, FL 33137",
    hours: "Mon-Sat 10am-8pm, Sun 12pm-6pm",
    phone: "(305) 555-0404",
    image: "https://picsum.photos/seed/showroom-miami/600/400",
    mapUrl: "https://maps.google.com",
  },
  {
    id: "sr-5",
    name: "FSOW Hayes Valley",
    city: "San Francisco",
    address: "456 Hayes St, Hayes Valley, San Francisco, CA 94102",
    hours: "Mon-Sat 10am-7pm, Sun 11am-6pm",
    phone: "(415) 555-0505",
    image: "https://picsum.photos/seed/showroom-sf/600/400",
    mapUrl: "https://maps.google.com",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShowroomsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShowrooms = showrooms.filter(
    (showroom) =>
      showroom.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      showroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      showroom.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <SectionHeading
        title="Visit Our Showrooms"
        subtitle="Experience FSOW furniture in person. Touch the materials, test the comfort, and get expert design advice."
      />

      {/* Map placeholder */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl bg-muted border mb-8 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              Interactive Map
            </p>
            <p className="text-muted-foreground/60 text-sm">
              5 Showroom Locations Across the US
            </p>
          </div>
        </div>
        {/* Decorative dots to simulate a map */}
        {showrooms.map((s, i) => (
          <div
            key={s.id}
            className="absolute w-3 h-3 rounded-full bg-primary shadow-lg animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Search input */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by city or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Showroom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShowrooms.map((showroom, index) => (
          <motion.div
            key={showroom.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden h-full">
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={showroom.image}
                  alt={showroom.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm">
                  {showroom.city}
                </Badge>
              </div>

              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold text-lg">{showroom.name}</h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{showroom.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{showroom.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{showroom.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a
                      href={showroom.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Get Directions
                    </a>
                  </Button>
                  <Button size="sm" className="flex-1">
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredShowrooms.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No showrooms found</h3>
          <p className="text-muted-foreground text-sm">
            Try searching for a different city or location.
          </p>
        </div>
      )}
    </div>
  );
}
