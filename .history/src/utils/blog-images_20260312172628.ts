/**
 * Utility functions for optimized blog images in WebP format
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Convert Unsplash URL to WebP format with compression
 * @param unsplashUrl - Original Unsplash image URL
 * @param options - Image optimization options
 * @returns Optimized WebP image URL
 */
export function getOptimizedImageUrl(
  unsplashUrl: string,
  options: ImageOptions = {}
): string {
  const {
    width = 1200,
    height = 800,
    quality = 80,
    fit = 'cover'
  } = options;

  // Parse the Unsplash URL
  const url = new URL(unsplashUrl);
  
  // Update parameters for WebP format and compression
  url.searchParams.set('fm', 'webp'); // Force WebP format
  url.searchParams.set('w', width.toString());
  url.searchParams.set('h', height.toString());
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('fit', fit);
  url.searchParams.set('auto', 'format,compress'); // Auto optimization
  
  return url.toString();
}

/**
 * Get blog featured image URL optimized for listing page
 */
export function getBlogListingImageUrl(unsplashUrl: string): string {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 800,
    height: 600,
    quality: 75,
    fit: 'cover'
  });
}

/**
 * Get blog hero image URL optimized for single post page
 */
export function getBlogHeroImageUrl(unsplashUrl: string): string {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 1600,
    height: 900,
    quality: 85,
    fit: 'cover'
  });
}

/**
 * Get thumbnail image URL for related posts
 */
export function getBlogThumbnailUrl(unsplashUrl: string): string {
  return getOptimizedImageUrl(unsplashUrl, {
    width: 400,
    height: 300,
    quality: 70,
    fit: 'cover'
  });
}

/**
 * Preload image for better performance
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Blog image data with Unsplash URLs
 */
export const blogImages = {
  'cosmetic-shop-near-me': 'https://images.unsplash.com/photo-1760621393386-3906922b0b78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwY29zbWV0aWMlMjBzdG9yZSUyMG5hdHVyYWwlMjBwcm9kdWN0c3xlbnwxfHx8fDE3Njk2NTYwNjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'moisturizing-cream-guide': 'https://images.unsplash.com/photo-1767611033962-6e3124c71450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2lzdHVyaXppbmclMjBmYWNlJTIwY3JlYW0lMjBqYXJ8ZW58MXx8fHwxNzY5NjU2MDY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'betnovate-cream-alternatives': 'https://images.unsplash.com/photo-1758525732480-8df43412b54c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbiUyMHRyZWF0bWVudCUyMGhlcmJzfGVufDF8fHx8MTc2OTY1NjA2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  'prp-hair-treatment-guide': 'https://images.unsplash.com/photo-1732861612355-c81b32c70075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwaGFpciUyMHRyZWF0bWVudCUyMG5hdHVyYWx8ZW58MXx8fHwxNzY5NjU2MDY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'beta-hydroxy-acid-explained': 'https://images.unsplash.com/photo-1671492241117-116140bdc1dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGluZ3JlZGllbnRzJTIwbmF0dXJhbCUyMGFjaWRzfGVufDF8fHx8MTc2OTY1NjA2OHww&ixlib=rb-4.1.0&q=80&w=1080',
  'clinic-skin-care-vs-natural': 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGNsaW5pYyUyMHRyZWF0bWVudHxlbnwxfHx8fDE3Njk2NTYwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'manicure-pedicure-guide': 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBza2luY2FyZSUyMGNsaW5pYyUyMHRyZWF0bWVudHxlbnwxfHx8fDE3Njk2NTYwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'fine-face-cream-selection': 'https://images.unsplash.com/photo-1763503839418-2b45c3d7a3c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBvcmdhbmljJTIwZmFjZSUyMGNyZWFtfGVufDF8fHx8MTc2OTY1NjA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'tan-removal-remedies': 'https://images.unsplash.com/photo-1572187651893-d5079b001f35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwdGFuJTIwcmVtb3ZhbCUyMHNraW5jYXJlfGVufDF8fHx8MTc2OTY1NjA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'skin-whitening-brightening-home-remedies': 'https://images.unsplash.com/photo-1731599974318-97a336b9bd5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG93aW5nJTIwcmFkaWFudCUyMHNraW4lMjBuYXR1cmFsfGVufDF8fHx8MTc2OTY1NjA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'dark-spots-dark-circles-natural-remedies': 'https://images.unsplash.com/photo-1731599974318-97a336b9bd5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG93aW5nJTIwcmFkaWFudCUyMHNraW4lMjBuYXR1cmFsfGVufDF8fHx8MTc2OTY1NjA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'face-serum-toner-exfoliator-guide': 'https://images.unsplash.com/photo-1688413467024-c539918fdd7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwc2VydW0lMjBkcm9wcGVyJTIwc2tpbmNhcmV8ZW58MXx8fHwxNzY5NjU2MDcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'complete-personal-care-skin-health-guide': 'https://images.unsplash.com/photo-1762651356493-c492ca111a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBjb2xsZWN0aW9uJTIwcHJvZHVjdHN8ZW58MXx8fHwxNzY5NjU2MDcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'hair-dandruff-lip-blush-facial-treatments': 'https://images.unsplash.com/photo-1762254840019-ac371b4e5482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwYmVhdXR5JTIwdHJlYXRtZW50JTIwc3BhfGVufDF8fHx8MTc2OTY1NjA3MXww&ixlib=rb-4.1.0&q=80&w=1080',
};

/**
 * Get blog image URL by slug
 */
export function getBlogImageUrl(slug: string): string {
  return blogImages[slug as keyof typeof blogImages] || blogImages['cosmetic-shop-near-me'];
}
