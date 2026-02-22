// ---------------------------------------------------------------------------
// Showrooms mock data — 5 physical showroom locations
// ---------------------------------------------------------------------------

import { showroomImage } from "./images";

// ---- Types ----------------------------------------------------------------

export interface ShowroomAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ShowroomCoordinates {
  lat: number;
  lng: number;
}

export interface Showroom {
  id: string;
  name: string;
  slug: string;
  address: ShowroomAddress;
  phone: string;
  email: string;
  hours: string;
  image: string;
  coordinates: ShowroomCoordinates;
  features: string[];
}

// ---- Data -----------------------------------------------------------------

export const showrooms: Showroom[] = [
  {
    id: "sr-001",
    name: "FSOW San Francisco Flagship",
    slug: "san-francisco",
    address: {
      street: "680 Folsom Street",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
    },
    phone: "(415) 555-0200",
    email: "sf@fsow.com",
    hours: "Mon-Sat 10am-7pm, Sun 11am-6pm",
    image: showroomImage("san-francisco"),
    coordinates: { lat: 37.7849, lng: -122.3994 },
    features: [
      "Full product catalog on display",
      "Interior design consultations",
      "White-glove delivery scheduling",
      "Child-friendly play area",
      "Complimentary coffee bar",
      "AR room visualization kiosks",
    ],
  },
  {
    id: "sr-002",
    name: "FSOW New York SoHo",
    slug: "new-york",
    address: {
      street: "155 Mercer Street",
      city: "New York",
      state: "NY",
      zip: "10012",
    },
    phone: "(212) 555-0201",
    email: "nyc@fsow.com",
    hours: "Mon-Sat 10am-8pm, Sun 11am-7pm",
    image: showroomImage("new-york"),
    coordinates: { lat: 40.7260, lng: -73.9993 },
    features: [
      "Three-floor showroom",
      "Personal shopping appointments",
      "Fabric and finish sample library",
      "Trade program desk",
      "Same-day delivery for in-stock items",
    ],
  },
  {
    id: "sr-003",
    name: "FSOW Los Angeles",
    slug: "los-angeles",
    address: {
      street: "8500 Beverly Boulevard",
      city: "Los Angeles",
      state: "CA",
      zip: "90048",
    },
    phone: "(310) 555-0202",
    email: "la@fsow.com",
    hours: "Mon-Sat 10am-7pm, Sun 11am-6pm",
    image: showroomImage("los-angeles"),
    coordinates: { lat: 34.0736, lng: -118.3695 },
    features: [
      "Indoor-outdoor living displays",
      "Interior design studio",
      "Free parking garage",
      "Outdoor furniture garden",
      "Material sustainability exhibit",
    ],
  },
  {
    id: "sr-004",
    name: "FSOW Chicago",
    slug: "chicago",
    address: {
      street: "900 North Michigan Avenue",
      city: "Chicago",
      state: "IL",
      zip: "60611",
    },
    phone: "(312) 555-0203",
    email: "chicago@fsow.com",
    hours: "Mon-Sat 10am-7pm, Sun 12pm-5pm",
    image: showroomImage("chicago"),
    coordinates: { lat: 41.8987, lng: -87.6234 },
    features: [
      "Two-floor showroom on the Mag Mile",
      "Home office ergonomics center",
      "Complimentary design consultations",
      "Mattress testing suite",
      "Valet parking available",
    ],
  },
  {
    id: "sr-005",
    name: "FSOW Austin",
    slug: "austin",
    address: {
      street: "1100 South Congress Avenue",
      city: "Austin",
      state: "TX",
      zip: "78704",
    },
    phone: "(512) 555-0204",
    email: "austin@fsow.com",
    hours: "Mon-Sat 10am-7pm, Sun 12pm-6pm",
    image: showroomImage("austin"),
    coordinates: { lat: 30.2500, lng: -97.7496 },
    features: [
      "SoCo neighborhood location",
      "Live-edge wood workshop tours",
      "Covered patio furniture garden",
      "Dog-friendly showroom",
      "Local artisan collaboration space",
    ],
  },
];

// ---- Lookup helpers -------------------------------------------------------

export function getShowroomBySlug(slug: string): Showroom | undefined {
  return showrooms.find((s) => s.slug === slug);
}

export function getShowroomById(id: string): Showroom | undefined {
  return showrooms.find((s) => s.id === id);
}
