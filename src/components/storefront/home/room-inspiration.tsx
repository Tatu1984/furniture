import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";

const inspirations = [
  {
    id: "insp-1",
    room: "Modern Living Room",
    slug: "living-room",
    image: "https://picsum.photos/seed/insp-living/600/800",
    aspect: "tall" as const,
  },
  {
    id: "insp-2",
    room: "Cozy Bedroom",
    slug: "bedroom",
    image: "https://picsum.photos/seed/insp-bedroom/600/500",
    aspect: "medium" as const,
  },
  {
    id: "insp-3",
    room: "Elegant Dining",
    slug: "dining",
    image: "https://picsum.photos/seed/insp-dining/600/700",
    aspect: "tall" as const,
  },
  {
    id: "insp-4",
    room: "Home Office",
    slug: "office",
    image: "https://picsum.photos/seed/insp-office/600/450",
    aspect: "short" as const,
  },
  {
    id: "insp-5",
    room: "Outdoor Retreat",
    slug: "outdoor",
    image: "https://picsum.photos/seed/insp-outdoor/600/650",
    aspect: "medium" as const,
  },
  {
    id: "insp-6",
    room: "Styled Decor",
    slug: "decor",
    image: "https://picsum.photos/seed/insp-decor/600/550",
    aspect: "medium" as const,
  },
];

const aspectClasses = {
  tall: "aspect-[3/4]",
  medium: "aspect-[4/3]",
  short: "aspect-[5/3]",
} as const;

export function RoomInspiration() {
  return (
    <section className="container mx-auto px-4 py-20">
      <SectionHeading
        title="Room Inspiration"
        subtitle="Discover how our furniture transforms real spaces into dream homes."
      />

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {inspirations.map((item) => (
          <Link
            key={item.id}
            href={`/categories/${item.slug}`}
            className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-xl"
          >
            <div className={`relative ${aspectClasses[item.aspect]}`}>
              <Image
                src={item.image}
                alt={item.room}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                <span className="translate-y-4 text-lg font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  View {item.room}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
