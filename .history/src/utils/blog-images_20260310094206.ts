/**
 * Utility functions for optimized blog images
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export function getOptimizedImageUrl(
  unsplashUrl: string,
  options: ImageOptions = {}
): string {
  const {
    width = 1200,
    height = 800,
    quality = 80,
    fit = "cover",
  } = options;

  const url = new URL(unsplashUrl);

  url.searchParams.set("fm", "webp");
  url.searchParams.set("w", width.toString());
  url.searchParams.set("h", height.toString());
  url.searchParams.set("q", quality.toString());
  url.searchParams.set("fit", fit);
  url.searchParams.set("auto", "format,compress");

  return url.toString();
}

export function getBlogListingImageUrl(unsplashUrl: string) {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 800,
    height: 600,
    quality: 75,
  });
}

export function getBlogHeroImageUrl(unsplashUrl: string) {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 1600,
    height: 900,
    quality: 85,
  });
}

export function getBlogThumbnailUrl(unsplashUrl: string) {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 400,
    height: 300,
    quality: 70,
  });
}

export const blogImages = {
  "cosmetic-shop-near-me":
    "https://images.unsplash.com/photo-1760621393386-3906922b0b78",
  "moisturizing-cream-guide":
    "https://images.unsplash.com/photo-1767611033962-6e3124c71450",
};

export function getBlogImageUrl(slug: string): string {
  return (
    blogImages[slug as keyof typeof blogImages] ||
    blogImages["cosmetic-shop-near-me"]
  );
}