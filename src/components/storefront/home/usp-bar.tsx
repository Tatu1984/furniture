"use client";

import { motion } from "motion/react";
import { Truck, RotateCcw, Shield, Award } from "lucide-react";

const usps = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over $999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Premium materials only",
  },
  {
    icon: Award,
    title: "5-Year Warranty",
    description: "We stand behind our craft",
  },
];

export function UspBar() {
  return (
    <section className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {usps.map((usp, index) => (
            <motion.div
              key={usp.title}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: "easeOut",
              }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <usp.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground md:text-base">
                {usp.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                {usp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
