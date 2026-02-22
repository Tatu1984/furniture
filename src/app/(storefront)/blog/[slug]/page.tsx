"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ChevronUp } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { ProductCard, type ProductCardData } from "@/components/storefront/product-card";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const blogPostsData: Record<
  string,
  {
    title: string;
    excerpt: string;
    heroImage: string;
    category: string;
    date: string;
    readTime: number;
    author: { name: string; avatar: string; bio: string };
    headings: string[];
    content: string[];
  }
> = {
  "how-to-choose-sofa": {
    title: "How to Choose the Perfect Sofa for Your Living Room",
    excerpt:
      "Finding the right sofa is about more than just style. Learn how to balance comfort, durability, and design to find your perfect match.",
    heroImage: "https://picsum.photos/seed/blog-sofa/1400/800",
    category: "Buying Guide",
    date: "Jan 15, 2024",
    readTime: 8,
    author: {
      name: "Emily Chen",
      avatar: "https://picsum.photos/seed/avatar-emily/100/100",
      bio: "Interior designer and lifestyle writer with 12 years of experience creating beautiful, functional spaces.",
    },
    headings: [
      "Understanding Your Space",
      "Choosing the Right Size",
      "Materials and Upholstery",
      "Frame and Construction Quality",
      "Comfort and Cushion Types",
      "Style and Aesthetic Considerations",
    ],
    content: [
      "Before you begin shopping for a sofa, take time to measure your living room carefully. Consider not just the floor space, but also doorways, hallways, and elevators the sofa will need to pass through during delivery. A common mistake is falling in love with a sofa in a showroom only to discover it overwhelms your actual space. Mark out the dimensions on your floor with painter's tape to visualize how the sofa will fit.",
      "The ideal sofa size depends on your room's proportions and how many people you typically need to seat. A standard three-seater sofa measures between 78 and 96 inches wide, while a loveseat is typically 52 to 72 inches. For larger rooms, consider an L-shaped sectional, which can define separate zones in an open-plan layout. Always leave at least 18 inches between the sofa and the coffee table for comfortable legroom.",
      "The fabric or leather you choose affects both the look and longevity of your sofa. Performance fabrics like microfiber and solution-dyed acrylics resist stains and fading, making them ideal for families with children or pets. Natural fibers like linen and cotton offer a relaxed, breathable feel but may require more maintenance. Top-grain leather develops a beautiful patina over time and is remarkably durable, though it comes at a premium price point.",
      "A well-built frame is the foundation of a long-lasting sofa. Look for kiln-dried hardwood frames, which resist warping and cracking. Avoid frames made from particleboard, plastic, or metal, as these tend to weaken over time. The joints should be doweled, screwed, and glued rather than just stapled or nailed. A quality sofa frame should last 15 to 20 years with proper care.",
      "Cushion fill determines how your sofa feels to sit on and how well it maintains its shape. High-resilience foam provides firm, consistent support and bounces back quickly. Down and feather fills offer a luxuriously soft, sink-in feeling but require regular fluffing. Many premium sofas use a combination: a foam core wrapped in down or polyester fiber for the best of both worlds. Consider how you use your sofa daily when choosing cushion firmness.",
      "Your sofa should complement your existing decor while reflecting your personal style. Mid-century modern designs with clean lines and tapered legs work well in contemporary spaces. Rolled arms and tufted backs bring a classic, traditional elegance. Modular designs offer flexibility for those who like to rearrange their space or expect to move. Choose a neutral color for longevity, and add personality through throw pillows and blankets.",
    ],
  },
  "bedroom-design-trends": {
    title: "2024 Bedroom Design Trends You Need to Know",
    excerpt:
      "From earthy tones to minimalist frames, discover the top bedroom trends shaping the year ahead.",
    heroImage: "https://picsum.photos/seed/blog-bedroom/1400/800",
    category: "Trends",
    date: "Feb 2, 2024",
    readTime: 6,
    author: {
      name: "Marcus Rivera",
      avatar: "https://picsum.photos/seed/avatar-marcus/100/100",
      bio: "Furniture industry analyst and design trend forecaster passionate about the intersection of comfort and style.",
    },
    headings: [
      "Earthy Color Palettes",
      "Minimalist Bed Frames",
      "Organic Textures",
      "Smart Bedroom Integration",
      "Statement Headboards",
      "Sustainable Materials",
    ],
    content: [
      "This year sees a continued shift toward warm, earthy color palettes in the bedroom. Think terracotta, sage green, warm sand, and deep clay. These colors create a cocoon-like atmosphere that promotes relaxation and restful sleep. Many designers are moving away from the all-white bedroom in favor of these richer, more grounding tones. The key is to layer several earthy hues together for depth rather than relying on a single color.",
      "The minimalist bed frame trend shows no signs of slowing down. Low-profile platform beds with clean geometric lines dominate the market, often featuring slim metal or natural wood frames. The Japanese-inspired approach emphasizes the bed as a grounding element in the room. Floating bed frames that appear to hover above the floor create a particularly striking visual effect and make cleaning underneath effortless.",
      "Natural and organic textures are essential to the 2024 bedroom. Bouclé upholstery, linen bedding, raw wood nightstands, and woven rattan accents bring warmth and tactile interest to the space. The trend is about creating layers of texture rather than visual pattern. A linen duvet paired with a chunky knit throw and cotton percale sheets creates an inviting bed that begs to be touched.",
      "Smart home technology is being seamlessly integrated into bedroom furniture. Nightstands with built-in wireless charging pads, beds with under-bed lighting systems controlled by voice or app, and motorized adjustable bases are becoming standard rather than luxury features. The key trend is invisible technology: smart features that enhance daily life without adding visual clutter or complexity.",
      "While bed frames are getting simpler, headboards are getting bolder. Oversized upholstered headboards that extend wall-to-wall create a dramatic focal point. Arched headboards, channel-tufted designs, and headboards with integrated shelving or reading lights are all gaining popularity. Some designers are even using the headboard as an art piece, with sculptural or asymmetrical shapes.",
      "Sustainability continues to drive purchasing decisions in bedroom furniture. Reclaimed wood, bamboo, and FSC-certified materials are increasingly standard. Mattresses made from natural latex, organic cotton, and wool appeal to health-conscious consumers. The most forward-thinking brands now offer take-back programs and use recyclable packaging, making it easier for consumers to furnish their bedrooms responsibly.",
    ],
  },
  "dining-room-styling": {
    title: "Styling Your Dining Room for Every Occasion",
    excerpt:
      "Transform your dining space from everyday meals to elegant dinner parties with these practical styling tips.",
    heroImage: "https://picsum.photos/seed/blog-dining/1400/800",
    category: "Interior Design",
    date: "Feb 18, 2024",
    readTime: 5,
    author: {
      name: "Sophia Park",
      avatar: "https://picsum.photos/seed/avatar-sophia/100/100",
      bio: "Event stylist and home entertaining expert who believes every meal deserves a beautiful setting.",
    },
    headings: [
      "Everyday Elegance",
      "The Perfect Table Setting",
      "Lighting Matters",
      "Centerpiece Ideas",
      "Mixing Chairs and Styles",
      "Storage and Display",
    ],
    content: [
      "Your dining room should feel welcoming for Tuesday dinners and Saturday celebrations alike. Start with a quality table runner or placemats as your everyday foundation. Cloth napkins in a neutral tone elevate even the simplest weeknight meal. Keep a small potted plant or simple vase of greenery as a permanent centerpiece that requires minimal fuss.",
      "Layer your table setting from the bottom up: charger plate, dinner plate, salad plate, with flatware arranged in order of use from the outside in. For casual gatherings, skip the charger but keep the layered plate approach for visual interest. Water glasses go above the knife, wine glasses to the right. A bread plate to the upper left completes the setting without feeling overly formal.",
      "The right lighting transforms a dining experience. A dimmer switch is the single best investment for dining room ambiance. Pendant lights or a chandelier should hang 30 to 36 inches above the table surface. Supplement overhead lighting with candles at varying heights for warmth and intimacy. Smart bulbs that adjust color temperature from cool daylight to warm candlelight offer flexibility for any occasion.",
      "Centerpieces should enhance conversation, not obstruct it. Keep arrangements below 12 inches tall or use tall, slender designs that guests can see through. Seasonal elements like pinecones in winter or fresh herbs in summer add a natural, timely touch. For longer tables, a series of small arrangements spaced evenly creates more visual interest than one large centerpiece.",
      "Gone are the days of matching dining sets. Mixing chair styles creates a collected, personal look. Try pairing upholstered host chairs at each end with wooden side chairs, or mix two different chair designs alternating around the table. Keep a common thread like wood tone or seat height to maintain cohesion. A bench on one side adds flexibility for extra guests and a relaxed feel.",
      "A sideboard or buffet serves dual purpose: display space for your favorite ceramics and serveware, and practical storage for table linens and candles. Open shelving showcases your collection while keeping items accessible. Consider a bar cart nearby for drinks service during gatherings. The key is balancing decorative display with functional storage so everything you need for entertaining is within reach.",
    ],
  },
  "home-office-setup": {
    title: "The Ultimate Home Office Setup Guide",
    excerpt:
      "Create a productive and ergonomic workspace at home with our comprehensive guide to furniture selection and layout.",
    heroImage: "https://picsum.photos/seed/blog-office/1400/800",
    category: "Tips",
    date: "Mar 5, 2024",
    readTime: 10,
    author: {
      name: "James Wright",
      avatar: "https://picsum.photos/seed/avatar-james/100/100",
      bio: "Ergonomics consultant and remote work advocate helping people build healthier, more productive workspaces.",
    },
    headings: [
      "Choosing the Right Desk",
      "Ergonomic Chair Selection",
      "Monitor and Screen Placement",
      "Lighting Your Workspace",
      "Storage and Organization",
      "Creating Boundaries",
    ],
    content: [
      "Your desk is the centerpiece of your home office. Standing desks with electric adjustment allow you to alternate between sitting and standing throughout the day, which research suggests improves energy and focus. A desk depth of at least 24 inches accommodates a monitor at the proper distance. Look for desks with built-in cable management to keep your workspace clean and organized. L-shaped desks provide extra surface area for dual monitors or spreading out reference materials.",
      "Invest more in your office chair than any other piece of furniture. An ergonomic chair should support the natural curve of your spine with adjustable lumbar support. Look for adjustable seat height, armrests, and tilt tension. The seat should be deep enough to support your thighs without pressing against the back of your knees. Mesh backs offer better breathability for long work sessions, while cushioned seats provide comfort during extended periods of sitting.",
      "Position your monitor at arm's length, with the top of the screen at or slightly below eye level. This prevents neck strain from looking up or down for extended periods. If using a laptop, invest in a laptop stand to raise the screen and pair it with an external keyboard and mouse. For dual monitors, angle them slightly inward in a gentle V shape so you can view both screens with minimal head turning.",
      "Natural light is ideal for a home office, but position your desk perpendicular to windows rather than facing them to avoid glare. A good desk lamp with adjustable color temperature lets you match the ambient light throughout the day. Cool white light (4000-5000K) enhances alertness for focused work, while warmer tones (2700-3000K) reduce eye strain in the evening. Consider bias lighting behind your monitor to reduce contrast and eye fatigue.",
      "A clutter-free desk promotes a clutter-free mind. Filing cabinets, desktop organizers, and floating shelves keep essential items accessible without covering your work surface. The two-minute rule works for physical organization too: if it takes less than two minutes to file or put away, do it immediately. Consider a pegboard or wall-mounted system for frequently used tools and supplies.",
      "Establishing clear boundaries between work and living space is crucial for work-life balance. If you cannot dedicate an entire room, use furniture to create visual separation: a bookshelf as a room divider, a different rug to define the work zone, or a cabinet that closes to hide your workspace at the end of the day. Some people find that a specific lighting setup or even a scented candle helps signal the transition between work mode and home mode.",
    ],
  },
  "outdoor-living-guide": {
    title: "Creating Your Perfect Outdoor Living Space",
    excerpt:
      "Turn your patio or deck into an extension of your home with weather-resistant furniture and clever design solutions.",
    heroImage: "https://picsum.photos/seed/blog-outdoor/1400/800",
    category: "Interior Design",
    date: "Mar 20, 2024",
    readTime: 7,
    author: {
      name: "Emily Chen",
      avatar: "https://picsum.photos/seed/avatar-emily/100/100",
      bio: "Interior designer and lifestyle writer with 12 years of experience creating beautiful, functional spaces.",
    },
    headings: [
      "Planning Your Layout",
      "Weather-Resistant Materials",
      "Comfort Outdoors",
      "Shade and Shelter",
      "Outdoor Lighting",
      "Accessorize with Nature",
    ],
    content: [
      "Treat your outdoor space like an additional room. Define zones for dining, lounging, and conversation, just as you would inside. Leave clear pathways between zones, at least 36 inches wide for comfortable movement. Consider the views from inside your home and position the primary seating area where it creates an inviting scene through your windows or doors.",
      "Choose materials that withstand your specific climate. Teak, eucalyptus, and cedar are naturally rot-resistant hardwoods. Powder-coated aluminum offers a lightweight, rust-proof alternative. All-weather wicker made from synthetic resin maintains its appearance season after season. For cushions and upholstery, solution-dyed acrylic fabrics like Sunbrella resist fading, mildew, and moisture while remaining soft to the touch.",
      "Outdoor comfort starts with proper cushion depth and support. Seat cushions should be at least 4 inches thick with quick-dry foam cores that shed water rapidly. Add throw pillows for back support and visual interest, choosing outdoor-rated fabrics that complement your color scheme. An outdoor rug anchors the seating area and provides warmth underfoot on cool evenings.",
      "Sun protection extends the hours you can enjoy your outdoor space. Retractable awnings offer flexibility, while permanent pergolas with climbing plants provide natural, dappled shade that evolves throughout the day. Large market umbrellas are the most affordable shading option and can be moved as the sun travels. For year-round use, consider a covered pavilion with optional curtain panels that can shield against rain and wind.",
      "Layer your outdoor lighting just as you would indoors. String lights overhead create a magical canopy effect that defines the space at night. Solar-powered path lights along walkways ensure safety while adding ambiance. LED candles or lanterns on tables provide intimate, flickering light without the fire risk. Smart outdoor lighting systems allow you to control brightness and timing from your phone.",
      "Container gardens, climbing plants, and potted trees add life and privacy to your outdoor room. Tall planters with ornamental grasses create natural screening from neighbors. Herb gardens near the dining area are both beautiful and functional. Choose plants that thrive in your light conditions, and consider a drip irrigation system to simplify maintenance. Remember that the pots themselves are decorative elements: mix materials and sizes for visual interest.",
    ],
  },
  "sustainable-furniture": {
    title: "Why Sustainable Furniture Matters More Than Ever",
    excerpt:
      "Explore how eco-friendly materials and ethical manufacturing are reshaping the furniture industry for the better.",
    heroImage: "https://picsum.photos/seed/blog-sustainable/1400/800",
    category: "Trends",
    date: "Apr 1, 2024",
    readTime: 6,
    author: {
      name: "Marcus Rivera",
      avatar: "https://picsum.photos/seed/avatar-marcus/100/100",
      bio: "Furniture industry analyst and design trend forecaster passionate about the intersection of comfort and style.",
    },
    headings: [
      "The Environmental Impact",
      "Sustainable Materials",
      "Ethical Manufacturing",
      "Longevity Over Trends",
      "Circular Economy Initiatives",
      "Making Informed Choices",
    ],
    content: [
      "The furniture industry is one of the largest contributors to landfill waste, with millions of tons of discarded furniture ending up in dumps each year. Fast furniture, like fast fashion, encourages frequent replacement of cheaply made pieces. The environmental cost includes deforestation for raw materials, carbon emissions from manufacturing and shipping, and toxic chemicals from finishes and adhesives. Understanding this impact is the first step toward making better choices.",
      "Innovative materials are transforming what sustainable furniture looks like. Reclaimed wood gives new life to timber from old barns, factories, and ships. Bamboo grows rapidly without pesticides, making it an excellent renewable resource. Recycled metals and plastics are being engineered into beautiful, durable furniture components. Cork, hemp, and mycelium (mushroom-based materials) represent the cutting edge of bio-based furniture innovation.",
      "Beyond materials, how furniture is made matters enormously. Fair labor practices, safe working conditions, and living wages should be non-negotiable. Look for certifications like B Corp, Fair Trade, and GOTS (Global Organic Textile Standard). Transparency in the supply chain, from raw material sourcing to final assembly, indicates a brand that takes responsibility for its impact. Many artisan-focused brands work directly with craftspeople, ensuring both quality and fair compensation.",
      "The most sustainable piece of furniture is one you keep for decades. Investing in well-made, timeless designs reduces the cycle of consumption and disposal. Classic silhouettes, neutral finishes, and quality construction mean your furniture remains beautiful and functional as trends evolve. Modular systems that can be reconfigured or expanded extend the useful life of your purchase even further.",
      "Forward-thinking brands are embracing the circular economy through take-back programs, repair services, and refurbishment initiatives. Some companies offer trade-in credits when you upgrade, ensuring your old piece is responsibly resold or recycled. Furniture rental and subscription models are emerging for those who prefer flexibility without the waste of ownership. These programs keep materials in use and out of landfills.",
      "As a consumer, your purchasing decisions drive industry change. Research brands before buying: check their sustainability claims, look for third-party certifications, and read about their manufacturing practices. Ask about material sourcing, finishing processes, and end-of-life options. Choose pieces that can be easily repaired or have replacement parts available. Remember that spending more on quality is often more economical and environmentally sound in the long run.",
    ],
  },
};

const relatedProducts: ProductCardData[] = [
  {
    id: "rp-1",
    slug: "elara-sectional-sofa",
    name: "Elara Sectional Sofa",
    price: 1299,
    compareAtPrice: 1599,
    image: "https://picsum.photos/seed/elara-sofa/800/600",
    category: "Living Room",
    rating: 4.7,
    reviewCount: 124,
  },
  {
    id: "rp-2",
    slug: "haven-platform-bed",
    name: "Haven Platform Bed",
    price: 899,
    compareAtPrice: 1099,
    image: "https://picsum.photos/seed/haven-bed/800/600",
    category: "Bedroom",
    rating: 4.8,
    reviewCount: 203,
  },
  {
    id: "rp-3",
    slug: "metro-dining-table",
    name: "Metro Dining Table",
    price: 1099,
    image: "https://picsum.photos/seed/metro-table/800/600",
    category: "Dining",
    rating: 4.8,
    reviewCount: 112,
  },
  {
    id: "rp-4",
    slug: "horizon-desk",
    name: "Horizon Standing Desk",
    price: 649,
    image: "https://picsum.photos/seed/horizon-desk/800/600",
    category: "Office",
    rating: 4.6,
    reviewCount: 142,
  },
];

const relatedArticles = [
  {
    slug: "bedroom-design-trends",
    title: "2024 Bedroom Design Trends You Need to Know",
    image: "https://picsum.photos/seed/blog-bedroom/800/450",
    category: "Trends",
    readTime: 6,
  },
  {
    slug: "dining-room-styling",
    title: "Styling Your Dining Room for Every Occasion",
    image: "https://picsum.photos/seed/blog-dining/800/450",
    category: "Interior Design",
    readTime: 5,
  },
  {
    slug: "sustainable-furniture",
    title: "Why Sustainable Furniture Matters More Than Ever",
    image: "https://picsum.photos/seed/blog-sustainable/800/450",
    category: "Trends",
    readTime: 6,
  },
];

// ---------------------------------------------------------------------------
// Table of contents component
// ---------------------------------------------------------------------------

function TableOfContents({
  headings,
  activeIndex,
}: {
  headings: string[];
  activeIndex: number;
}) {
  return (
    <nav className="space-y-1">
      <h3 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h3>
      {headings.map((heading, index) => (
        <a
          key={index}
          href={`#section-${index}`}
          className={`block text-sm py-1.5 pl-3 border-l-2 transition-colors ${
            index === activeIndex
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
          }`}
        >
          {heading}
        </a>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [activeSection, setActiveSection] = useState(0);

  const post = blogPostsData[slug] ?? blogPostsData["how-to-choose-sofa"]!;

  useEffect(() => {
    const handleScroll = () => {
      const sections = post.headings.map((_, i) =>
        document.getElementById(`section-${i}`)
      );
      const scrollPos = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post.headings]);

  return (
    <article>
      {/* Hero image */}
      <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden">
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BreadcrumbNav
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mb-10"
        >
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {post.author.name}
                </p>
                <p className="text-xs">{post.author.bio}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content + sidebar */}
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <div className="prose prose-lg max-w-none">
              {post.headings.map((heading, index) => (
                <section key={index} id={`section-${index}`} className="mb-10">
                  <h2 className="text-2xl font-bold tracking-tight mb-4">
                    {heading}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {post.content[index]}
                  </p>
                </section>
              ))}
            </div>

            <Separator className="my-12" />

            {/* Related Products */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* Related Articles */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles
                  .filter((a) => a.slug !== slug)
                  .slice(0, 3)
                  .map((article) => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm">
                          {article.category}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          {article.readTime} min read
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          </div>

          {/* Sticky sidebar — desktop only */}
          <aside className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-24">
              <TableOfContents
                headings={post.headings}
                activeIndex={activeSection}
              />

              <Separator className="my-6" />

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronUp className="mr-2 h-4 w-4" />
                Back to Top
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
