"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hammer, Leaf, Palette, Users, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";

// ---------------------------------------------------------------------------
// CountUp component
// ---------------------------------------------------------------------------

function CountUp({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const values = [
  {
    icon: Hammer,
    title: "Craftsmanship",
    description:
      "Every piece is built by skilled artisans who take pride in their work. We use time-tested joinery techniques combined with modern precision for furniture that lasts generations.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "From FSC-certified wood to water-based finishes, we choose materials and processes that respect the planet. Our packaging is 100% recyclable and plastic-free.",
  },
  {
    icon: Palette,
    title: "Design",
    description:
      "Our in-house design team blends timeless aesthetics with contemporary living. Each collection is thoughtfully curated to bring beauty and function to every room.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We partner with local makers and support design education initiatives. When you choose FSOW, you support a network of artisans and their families.",
  },
];

const teamMembers = [
  {
    name: "Olivia Harper",
    role: "Founder & CEO",
    avatar: "https://picsum.photos/seed/team-olivia/200/200",
  },
  {
    name: "Daniel Kim",
    role: "Head of Design",
    avatar: "https://picsum.photos/seed/team-daniel/200/200",
  },
  {
    name: "Ava Martinez",
    role: "Director of Sustainability",
    avatar: "https://picsum.photos/seed/team-ava/200/200",
  },
  {
    name: "Liam Chen",
    role: "Master Craftsman",
    avatar: "https://picsum.photos/seed/team-liam/200/200",
  },
];

const stats = [
  { value: 15, suffix: "+", label: "Years of Craftsmanship" },
  { value: 50, suffix: "K+", label: "Happy Homes" },
  { value: 200, suffix: "+", label: "Skilled Artisans" },
  { value: 12, suffix: "", label: "Showrooms Nationwide" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <div>
      {/* Hero section */}
      <section className="relative bg-muted/30 py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Our Story
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe that beautiful, well-crafted furniture transforms houses
              into homes. For over 15 years, FSOW has been creating pieces that
              stand the test of time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand story */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Built on a Foundation of Quality
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                FSOW was founded in 2009 with a simple mission: to make
                exceptional furniture accessible to everyone. What started as a
                small workshop in Brooklyn has grown into a beloved brand with
                twelve showrooms across the country.
              </p>
              <p>
                We work directly with over 200 artisans and small-batch
                manufacturers who share our commitment to quality and
                sustainability. Every piece of FSOW furniture is designed
                in-house and built with the same care and attention to detail
                that defined our earliest collections.
              </p>
              <p>
                Our approach is different from mass-market furniture companies.
                We invest in materials that last, construction methods that
                endure, and designs that never go out of style. The result is
                furniture you will love for decades, not just seasons.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <Image
              src="https://picsum.photos/seed/about-workshop/800/600"
              alt="FSOW workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide everything we create."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center">
                    <CardContent className="pt-6">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <SectionHeading
          title="Meet Our Team"
          subtitle="The passionate people behind FSOW."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="text-center"
            >
              <Avatar className="h-28 w-28 mx-auto mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-2xl">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <p className="text-primary-foreground/80 text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Experience FSOW In Person
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Visit one of our twelve showrooms to see, touch, and feel our
            furniture. Our design consultants are ready to help you create your
            perfect space.
          </p>
          <Button size="lg" asChild>
            <Link href="/showrooms">
              Visit Our Showrooms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
