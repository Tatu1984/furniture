"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#F5E6D0] via-[#FAF7F2] to-[#F5E6D0] dark:from-[#2A2520] dark:via-[#1A1A1A] dark:to-[#2A2520]">
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Stay Inspired
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Get design tips, exclusive offers, and early access to new
            collections delivered straight to your inbox.
          </p>

          {submitted ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-accent">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Thank you for subscribing! Check your inbox soon.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 sm:max-w-sm"
              />
              <Button type="submit" size="lg" className="h-12 px-8">
                <Send className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
