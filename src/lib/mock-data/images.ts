// ---------------------------------------------------------------------------
// Image helper utilities using picsum.photos/seed/ for deterministic images
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic picsum.photos URL seeded by a string key.
 * The same seed always returns the same image, which is great for mock data.
 */
export function picsumUrl(
  seed: string,
  width = 800,
  height = 600,
): string {
  const sanitized = seed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `https://picsum.photos/seed/${sanitized}/${width}/${height}`;
}

/** Product image (4:3 landscape) */
export function productImage(name: string, width = 800, height = 600): string {
  return picsumUrl(`product-${name}`, width, height);
}

/** Product thumbnail (1:1 square) */
export function productThumb(name: string, size = 400): string {
  return picsumUrl(`thumb-${name}`, size, size);
}

/** Category banner (wide landscape) */
export function categoryImage(slug: string, width = 1200, height = 600): string {
  return picsumUrl(`category-${slug}`, width, height);
}

/** Category icon-sized image */
export function categoryIcon(slug: string, size = 200): string {
  return picsumUrl(`caticon-${slug}`, size, size);
}

/** Blog post hero image */
export function blogImage(slug: string, width = 1200, height = 675): string {
  return picsumUrl(`blog-${slug}`, width, height);
}

/** Showroom image */
export function showroomImage(slug: string, width = 1000, height = 600): string {
  return picsumUrl(`showroom-${slug}`, width, height);
}

/** Avatar image */
export function avatarImage(name: string, size = 128): string {
  return picsumUrl(`avatar-${name}`, size, size);
}

/** Generate a set of gallery images for a product */
export function productGallery(name: string, count = 4): string[] {
  return Array.from({ length: count }, (_, i) =>
    picsumUrl(`product-${name}-${i + 1}`, 800, 800),
  );
}
