// ---------------------------------------------------------------------------
// Blog posts mock data — 12 articles about furniture and interior design
// ---------------------------------------------------------------------------

import { avatarImage, blogImage } from "./images";

// ---- Types ----------------------------------------------------------------

export interface BlogAuthor {
  name: string;
  avatar: string;
  bio: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

// ---- Authors --------------------------------------------------------------

const authors = {
  emma: {
    name: "Emma Hartley",
    avatar: avatarImage("emma-hartley"),
    bio: "Interior designer with 15 years of experience transforming residential spaces. Contributor to Architectural Digest and Elle Decor.",
  },
  marcus: {
    name: "Marcus Chen",
    avatar: avatarImage("marcus-chen"),
    bio: "Furniture maker and design writer. Passionate about sustainable materials and Scandinavian craft traditions.",
  },
  olivia: {
    name: "Olivia Brooks",
    avatar: avatarImage("olivia-brooks"),
    bio: "Home stylist and lifestyle blogger. Helps homeowners create spaces that reflect their personality without breaking the budget.",
  },
};

// ---- Data -----------------------------------------------------------------

export const blogPosts: BlogPost[] = [
  {
    id: "post-001",
    slug: "how-to-choose-the-perfect-sofa",
    title: "How to Choose the Perfect Sofa for Your Living Room",
    excerpt:
      "Buying a sofa is one of the biggest furniture investments you'll make. Here's how to get it right the first time.",
    content: `Choosing a sofa is about far more than picking a color you like. The right sofa needs to fit your space physically, match your lifestyle, and stand up to years of daily use. Start by measuring your room carefully — not just the floor space where the sofa will sit, but also doorways, hallways, and stairwells it needs to pass through during delivery. A common mistake is falling in love with a showroom piece only to discover it won't fit through a 32-inch apartment door.

Next, consider how you actually use your living room. If you entertain frequently, a firm, upright sofa with defined seats works well. If your living room is a nightly movie-watching haven, look for deep seats and soft cushions you can sink into. Families with young children or pets should prioritize performance fabrics that resist stains and clean easily — materials like Crypton, Sunbrella, or tightly woven polyester blends. Leather develops a beautiful patina over time but requires more maintenance.

Finally, think about construction quality. A well-made sofa has a kiln-dried hardwood frame (not pine or particle board), eight-way hand-tied springs or sinuous springs with a warranty, and high-resiliency foam cushions wrapped in down or polyester fiber. Expect to spend between $1,500 and $4,000 for a sofa that will last 10 to 15 years. It's an investment that pays off every time you sit down.`,
    author: authors.emma,
    category: "Buying Guide",
    tags: ["sofa", "living room", "buying guide", "upholstery"],
    image: blogImage("choose-perfect-sofa"),
    publishedAt: "2025-11-28T09:00:00Z",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: "post-002",
    slug: "scandinavian-design-principles",
    title: "5 Scandinavian Design Principles That Transform Any Home",
    excerpt:
      "Clean lines, natural materials, and functional beauty — the Nordic approach to interior design explained.",
    content: `Scandinavian design has dominated the furniture world for decades, and for good reason. At its core, Nordic design follows a simple philosophy: every object should be both beautiful and useful. The first principle is functionalism — nothing exists purely for decoration. A coffee table should offer storage, a lamp should illuminate the right zone, and a chair should support your posture for hours.

The second principle is natural materials. Scandinavian designers favor solid woods like oak, ash, and birch, often left in their natural finish to showcase the grain. Wool, linen, and cotton replace synthetic fabrics, creating tactile warmth. The third principle, minimalism, doesn't mean sparse or cold. Rather, it means editing ruthlessly — keeping only the pieces that serve a purpose or bring genuine joy. White walls amplify natural light (critical during long Nordic winters), while a few carefully chosen accessories add personality.

The fourth principle is craftsmanship. The Nordic tradition values objects that are made to last generations, not seasons. Look for joinery details like dovetails and mortise-and-tenon joints, and finishes that can be renewed rather than replaced. The fifth principle is hygge — the Danish concept of cozy contentment. Layer textures with wool throws, sheepskin rugs, and linen curtains. Add candles and warm-toned lighting. The result is a home that feels calm, inviting, and effortlessly stylish.`,
    author: authors.marcus,
    category: "Design Inspiration",
    tags: ["scandinavian", "nordic", "design principles", "minimalism"],
    image: blogImage("scandinavian-design"),
    publishedAt: "2025-11-15T09:00:00Z",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: "post-003",
    slug: "small-space-furniture-solutions",
    title: "10 Furniture Solutions for Small Apartments",
    excerpt:
      "Living small doesn't mean living without style. These clever furniture picks maximize every square foot.",
    content: `Small-space living is a design challenge that rewards creativity. The first rule is to prioritize dual-purpose furniture. A sofa bed eliminates the need for a guest room. An extendable dining table serves four on weeknights and eight for dinner parties, then folds back down. Storage ottomans hide blankets and magazines while providing extra seating. Even a bed frame with built-in drawers can replace an entire dresser.

Scale is critical in compact spaces. Choose furniture with slim profiles, exposed legs, and light colors — they create visual breathing room. A glass coffee table takes up less visual weight than a solid wood one. Wall-mounted shelves and floating TV consoles free up floor space and make rooms feel larger. Round tables work better than rectangular ones in tight dining areas because they eliminate sharp corners and allow easier traffic flow around them.

Vertical space is your greatest untapped resource. Tall, narrow bookcases store as much as wide ones using a fraction of the floor area. Over-door organizers, wall-mounted hooks, and magnetic knife strips keep everyday items accessible without cluttering counters. Finally, invest in a few statement pieces rather than filling every corner. One beautiful accent chair makes more impact than three forgettable ones, and the empty space around it actually makes the room feel more spacious.`,
    author: authors.olivia,
    category: "Tips & Tricks",
    tags: ["small space", "apartment", "storage", "dual-purpose"],
    image: blogImage("small-space-solutions"),
    publishedAt: "2025-11-01T09:00:00Z",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "post-004",
    slug: "sustainable-furniture-guide",
    title: "A Guide to Buying Sustainable Furniture",
    excerpt:
      "From FSC-certified wood to recycled materials, here's how to furnish your home with a clear conscience.",
    content: `The furniture industry has a significant environmental footprint, but conscious consumers have more sustainable options than ever. Start by looking for FSC (Forest Stewardship Council) or PEFC certification — these labels guarantee the wood was harvested responsibly from managed forests. Reclaimed wood goes a step further, giving new life to timber from old barns, factories, and demolished buildings while adding unique character to each piece.

Material choices matter beyond wood. Recycled HDPE (high-density polyethylene) makes excellent outdoor furniture that never needs painting or sealing and lasts for decades. Organic cotton and linen upholstery avoid the pesticides and chemicals used in conventional fabric production. Natural latex and wool padding replace petroleum-based foams. Even metal furniture can be sustainable when made from recycled aluminum or steel, which requires far less energy to process than virgin ore.

Longevity is perhaps the most sustainable quality of all. A well-built solid wood table that lasts 50 years is far greener than five cheap particleboard tables that each last 10 years. Look for traditional joinery, repairable finishes, and replaceable components. Buy from manufacturers who offer spare parts and repair services. And when you're done with a piece, choose to donate, sell, or upcycle rather than sending it to landfill. The greenest piece of furniture is the one you never have to replace.`,
    author: authors.marcus,
    category: "Sustainability",
    tags: ["sustainable", "eco-friendly", "fsc", "reclaimed wood"],
    image: blogImage("sustainable-furniture"),
    publishedAt: "2025-10-18T09:00:00Z",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "post-005",
    slug: "bedroom-layout-mistakes",
    title: "7 Bedroom Layout Mistakes You're Probably Making",
    excerpt:
      "Rethink your bedroom arrangement with these expert tips for better sleep, storage, and style.",
    content: `Your bedroom layout affects your sleep quality more than you might think. The most common mistake is placing the bed against a window — it looks dramatic but causes drafts, light leakage, and noise issues. Instead, position the bed against the longest solid wall, centered for visual balance. This anchoring creates a natural focal point and leaves room for nightstands on both sides, which are essential for keeping phones, books, and water glasses off the floor.

Mistake number two is blocking natural pathways. You should be able to walk around the bed with at least 60 centimeters of clearance on each side. If that's not possible, push one side against the wall and accept the asymmetry. Mistake three involves dresser placement — avoid putting a tall dresser right next to the bed, as it creates a looming presence that disrupts relaxation. Position dressers and wardrobes along secondary walls where they're accessible but not visually dominant from the pillow.

The remaining mistakes relate to lighting and scale. A single overhead light creates harsh, unflattering illumination. Layer your lighting with bedside lamps, a reading light, and perhaps a floor lamp for ambient warmth. Use dimmers wherever possible. As for scale, oversized furniture in a small bedroom feels oppressive, while tiny pieces in a large room look lost. The bed should fill roughly one-third of the room's floor area, leaving ample space for circulation and ancillary furniture.`,
    author: authors.emma,
    category: "Tips & Tricks",
    tags: ["bedroom", "layout", "interior design", "sleep"],
    image: blogImage("bedroom-layout"),
    publishedAt: "2025-10-05T09:00:00Z",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "post-006",
    slug: "mid-century-modern-revival",
    title: "The Mid-Century Modern Revival: Why It Endures",
    excerpt:
      "From Eames to today's reinterpretations, mid-century modern design continues to shape how we furnish our homes.",
    content: `Mid-century modern design, born in the post-war era of the 1940s through 1960s, has proven to be far more than a passing trend. Designers like Charles and Ray Eames, Arne Jacobsen, and Hans Wegner created furniture that was both revolutionary and timeless. Their work combined new materials — molded plywood, fiberglass, tubular steel — with organic forms inspired by nature. The result was furniture that felt light, optimistic, and accessible, a stark contrast to the heavy, ornate pieces that preceded it.

Today's revival goes beyond mere reproduction. Contemporary designers are reinterpreting mid-century principles using sustainable materials and modern manufacturing techniques. A classic spindle-back chair might be reimagined in FSC-certified ash rather than teak. The iconic low-slung silhouette of a mid-century credenza gets updated with soft-close drawers and built-in cable management for modern media equipment. The palette has evolved too — while original pieces favored orange, avocado, and mustard, today's interpretations lean into earthy neutrals, soft blues, and muted greens.

The style endures because its core principles are universal: honest materials, functional forms, and human-centered proportions. A well-designed mid-century chair is comfortable because it was engineered around the human body, not just styled to look good. This marriage of form and function makes mid-century pieces compatible with almost any interior, from a minimalist loft to a cozy cottage. That versatility is why, seven decades later, the movement shows no signs of slowing down.`,
    author: authors.marcus,
    category: "Design Inspiration",
    tags: ["mid-century modern", "design history", "eames", "furniture design"],
    image: blogImage("mid-century-revival"),
    publishedAt: "2025-09-22T09:00:00Z",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: "post-007",
    slug: "outdoor-furniture-care-guide",
    title: "How to Care for Your Outdoor Furniture Year-Round",
    excerpt:
      "Protect your patio investment from sun, rain, and seasonal changes with this maintenance guide.",
    content: `Outdoor furniture faces a relentless assault from UV rays, rain, temperature swings, and even bird droppings. With proper care, however, quality pieces can last decades. Teak is the gold standard for outdoor wood — its natural oils resist moisture and insects. New teak starts golden and weathers to a silver-grey patina that many people love. To maintain the original color, apply teak oil at the start and end of each outdoor season. For weather-beaten teak that needs refreshing, a light sanding followed by oiling will restore the warm glow.

Wicker and resin furniture requires less maintenance but still benefits from regular cleaning. Hose down resin wicker monthly to prevent dirt buildup in the weave. For stubborn stains, use a soft brush with mild dish soap and warm water. Aluminum frames are powder-coated for UV resistance but can develop oxidation spots over time — touch these up with matching spray paint from the manufacturer.

Cushions and fabric elements need the most attention. Even Sunbrella and other solution-dyed acrylics perform better when stored during harsh weather. Remove cushion covers and machine wash them at the start and end of each season. Between washes, brush off loose debris and blot spills promptly. During winter or extended periods of non-use, cover furniture with breathable covers (not plastic tarps, which trap moisture and promote mold). A little seasonal care goes a long way toward protecting your outdoor investment.`,
    author: authors.olivia,
    category: "Care & Maintenance",
    tags: ["outdoor", "maintenance", "teak", "patio furniture"],
    image: blogImage("outdoor-furniture-care"),
    publishedAt: "2025-09-08T09:00:00Z",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "post-008",
    slug: "home-office-ergonomics",
    title: "Setting Up an Ergonomic Home Office That Doesn't Sacrifice Style",
    excerpt:
      "Work comfortably and look good doing it. Here's how to create a home office that's both healthy and beautiful.",
    content: `The home office is no longer a temporary setup — it's a permanent feature of modern life. Getting the ergonomics right can prevent chronic pain and boost productivity, but that doesn't mean your workspace has to look clinical. Start with the desk: your elbows should form a 90-degree angle when typing, which means a desk height of roughly 72 to 76 centimeters for most adults. A sit-stand desk lets you alternate between positions throughout the day, and today's motorized options come in beautiful bamboo, walnut, and oak finishes that rival any traditional desk.

Your chair is arguably the most important purchase. Look for adjustable lumbar support that follows your spine's natural curve, a seat pan deep enough to support your thighs without pressing behind your knees, and armrests that allow your shoulders to remain relaxed. Mesh-back chairs breathe well during long sessions, while upholstered options blend seamlessly into living spaces. Position your monitor so the top of the screen is at or slightly below eye level, about an arm's length away. If you use a laptop, a separate keyboard and a laptop stand are non-negotiable for proper posture.

Lighting deserves special attention. Position your desk perpendicular to windows to minimize glare on your screen. Supplement natural light with a task lamp that provides focused illumination without creating harsh contrasts. Finally, personalize the space with plants, art, and accessories that inspire you. A well-designed home office proves that health, productivity, and aesthetics can coexist beautifully.`,
    author: authors.emma,
    category: "Buying Guide",
    tags: ["home office", "ergonomics", "standing desk", "office chair"],
    image: blogImage("home-office-ergonomics"),
    publishedAt: "2025-08-25T09:00:00Z",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "post-009",
    slug: "mixing-wood-tones-like-a-pro",
    title: "How to Mix Wood Tones Like an Interior Designer",
    excerpt:
      "Matching every wood piece used to be the rule. Today's designers embrace the mix — here's how to do it right.",
    content: `The days of perfectly matching wood furniture sets are over. Today's most interesting interiors combine oak, walnut, teak, and painted finishes in a single room. The key is understanding undertones. Woods generally fall into warm (orange/yellow/red) or cool (grey/ashy) families. Oak and maple tend to have warm, golden undertones. Walnut and mahogany lean warm-to-neutral with rich brown tones. Ash and birch can range from warm to cool depending on the finish. The safest approach is to mix within the same undertone family — pair golden oak with warm-toned walnut, for example.

Vary the darkness levels for visual interest. A room where every wood piece is the same shade of medium brown feels flat and monotonous. Instead, try a dark walnut dining table with light oak chairs, or a medium teak sideboard next to pale birch shelving. The contrast creates depth and hierarchy, drawing the eye to focal pieces. Including one painted or lacquered element — a white credenza or a black-framed bookshelf — breaks up the wood tones and prevents the space from feeling like a log cabin.

Repetition ties the mix together. If your dining table is walnut, echo that tone somewhere else in the room — perhaps in a picture frame, a small tray, or the legs of an accent chair. You don't need exact matches; approximate repetition is enough to create visual cohesion. Grounding the room with a neutral rug and consistent metal finishes (all brass, all black, or all chrome) provides the final layer of unity. The result is a space that feels collected and personal rather than decorated from a catalogue.`,
    author: authors.olivia,
    category: "Design Inspiration",
    tags: ["wood tones", "mixing materials", "interior design tips"],
    image: blogImage("mixing-wood-tones"),
    publishedAt: "2025-08-10T09:00:00Z",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "post-010",
    slug: "investing-in-quality-furniture",
    title: "Why Quality Furniture Is Worth the Investment",
    excerpt:
      "Breaking down the true cost of cheap vs. quality furniture over a lifetime.",
    content: `It's tempting to furnish a home quickly and cheaply, especially when budget options abound. But a closer look at the numbers tells a different story. A $300 particleboard bookshelf might last three to five years before sagging, chipping, or falling apart during a move. Over 20 years, you'd buy four of them, spending $1,200 total — plus the environmental cost of manufacturing and disposing of four units. A $700 solid wood bookshelf, by contrast, lasts those same 20 years (and likely much longer), costs less in the long run, and can be resold or donated when you're done with it.

Quality construction is visible in the details. Solid hardwood frames resist warping and cracking. Dovetail and mortise-and-tenon joints hold without glue or metal fasteners for decades. Full-extension, soft-close drawer slides outperform cheap roller mechanisms that jam and derail. High-resiliency foam cushions maintain their shape after thousands of compressions, while cheap foam compresses permanently within a year or two.

Beyond durability, quality furniture offers something intangible: daily satisfaction. There's a pleasure in pulling open a drawer that glides silently on ball-bearing slides, in sitting on a sofa whose cushions still feel supportive after five years, in running your hand over a tabletop with a finish that gets more beautiful with age. These micro-moments of appreciation compound into a fundamentally better relationship with your living space. The initial price tag is higher, but the cost per year of enjoyment is almost always lower with quality pieces.`,
    author: authors.marcus,
    category: "Buying Guide",
    tags: ["quality", "investment", "furniture care", "durability"],
    image: blogImage("investing-quality"),
    publishedAt: "2025-07-28T09:00:00Z",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "post-011",
    slug: "lighting-guide-for-every-room",
    title: "The Complete Lighting Guide for Every Room in Your Home",
    excerpt:
      "Layer ambient, task, and accent lighting to transform your rooms from functional to magical.",
    content: `Good lighting design uses three layers: ambient (general), task (focused), and accent (decorative). Ambient lighting provides the base illumination for a room — ceiling fixtures, recessed lights, or a central chandelier. Task lighting serves specific activities: a desk lamp for working, under-cabinet lights for cooking, or a reading lamp beside an armchair. Accent lighting adds drama and draws attention to architectural features, artwork, or plants — think picture lights, LED strip lighting, or uplighters.

Each room has different needs. Living rooms benefit from multiple sources: a statement pendant or floor lamp for ambient light, table lamps on side tables for task lighting, and perhaps LED strips behind a TV console for bias lighting that reduces eye strain. Dining rooms call for a pendant or chandelier centered over the table, hung about 75 centimeters above the surface for seated conversations. Dimmer switches are essential here to transition from bright family meals to intimate dinner parties.

Bedrooms should feel calm and restful. Avoid harsh overhead lighting; instead, use bedside lamps with warm-toned bulbs (2700K or lower) for reading and a soft ambient source like a wall sconce or table lamp on a dresser. Home offices need cool-white task lighting (4000K) to maintain alertness, positioned to the side of the monitor to avoid screen glare. In every room, aim for a color temperature that suits the mood: warm whites for relaxation, neutral whites for kitchens and bathrooms, and daylight for workspaces.`,
    author: authors.emma,
    category: "Tips & Tricks",
    tags: ["lighting", "interior design", "ambient", "pendant"],
    image: blogImage("lighting-guide"),
    publishedAt: "2025-07-12T09:00:00Z",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: "post-012",
    slug: "furniture-trends-2026",
    title: "Furniture Trends to Watch in 2026",
    excerpt:
      "From curved silhouettes to smart furniture, here are the design directions shaping the year ahead.",
    content: `As we move into 2026, several clear trends are emerging in furniture design. Curved silhouettes continue to dominate — rounded sofas, kidney-shaped coffee tables, and arched bookcases soften the hard angles of modern architecture and create inviting, organic spaces. This isn't a new direction, but designers are pushing it further with asymmetric forms and unexpected proportions that feel sculptural rather than simply round.

Sustainability is evolving from a marketing buzzword into a genuine design driver. Expect to see more furniture made from mycelium (mushroom-based) composites, ocean-recovered plastics, and bio-based resins. Finishes are moving toward plant-based oils and zero-VOC lacquers. The circular economy is also gaining traction, with major brands launching buyback programs and designing products for disassembly and recycling at end of life.

Smart furniture is crossing the threshold from novelty to necessity. Desks with built-in wireless charging, sofas with integrated USB ports, and beds with sleep-tracking sensors are becoming standard features rather than premium add-ons. The best implementations are invisible — you'd never know the nightstand has a Qi charger until you place your phone on it. Meanwhile, rich, saturated colors like deep terracotta, forest green, and midnight blue are replacing the all-grey palettes of the past decade, bringing warmth and personality back into our homes.`,
    author: authors.olivia,
    category: "Trends",
    tags: ["trends", "2026", "sustainability", "curved furniture", "smart furniture"],
    image: blogImage("furniture-trends-2026"),
    publishedAt: "2025-12-01T09:00:00Z",
    readTime: "5 min read",
    featured: true,
  },
];

// ---- Lookup helpers -------------------------------------------------------

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostById(id: string): BlogPost | undefined {
  return blogPosts.find((p) => p.id === id);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((p) => p.featured);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((p) => p.category === category);
}

export function getRecentPosts(limit = 6): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
