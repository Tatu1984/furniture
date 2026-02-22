import { HeroSection } from "@/components/storefront/home/hero-section";
import { CategoryShowcase } from "@/components/storefront/home/category-showcase";
import { FeaturedProducts } from "@/components/storefront/home/featured-products";
import { BestsellersSection } from "@/components/storefront/home/bestsellers-section";
import { RoomInspiration } from "@/components/storefront/home/room-inspiration";
import { UspBar } from "@/components/storefront/home/usp-bar";
import { TestimonialsSection } from "@/components/storefront/home/testimonials-section";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <BestsellersSection />
      <RoomInspiration />
      <UspBar />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
