import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";
import { RatingStars } from "@/components/shared/rating-stars";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: "test-1",
    quote:
      "The quality of the Oslo Sectional exceeded all my expectations. The craftsmanship is impeccable and it looks even better in person. Our living room has been completely transformed.",
    name: "Sarah Mitchell",
    location: "Portland, OR",
    rating: 5,
    avatar: "https://picsum.photos/seed/avatar-sarah/128/128",
  },
  {
    id: "test-2",
    quote:
      "I have been searching for the perfect dining table for months. The Walnut Dining Table from FSOW is exactly what I wanted -- solid, beautiful, and built to last generations.",
    name: "James Chen",
    location: "Austin, TX",
    rating: 5,
    avatar: "https://picsum.photos/seed/avatar-james/128/128",
  },
  {
    id: "test-3",
    quote:
      "The customer service was outstanding from start to finish. Free delivery, easy assembly, and the standing desk works flawlessly. I could not be happier with my purchase.",
    name: "Elena Rodriguez",
    location: "Denver, CO",
    rating: 4.5,
    avatar: "https://picsum.photos/seed/avatar-elena/128/128",
  },
];

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <SectionHeading
        title="What Our Customers Say"
        subtitle="Real stories from people who love their FSOW furniture."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
          >
            <Quote className="mb-4 h-8 w-8 text-primary/20" />

            <p className="flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
              &ldquo;{testimonial.quote}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t pt-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
              <RatingStars rating={testimonial.rating} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
