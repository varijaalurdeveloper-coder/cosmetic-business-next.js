import type { Metadata } from "next";

import { products } from "@/lib/data/products";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import type { Product } from "@/types";
import ProductDetailClient from "../ProductDetailClient";

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = products.find((item) => item.id === params.id);

  if (!product) {
    return {
      title: "Product not found | Rima Cosmetics",
      description: "This product could not be found.",
      alternates: {
        canonical: new URL(`/products/${params.id}`, SITE_URL),
      },
    };
  }

  const productUrl = new URL(`/products/${product.id}`, SITE_URL);
  const productImage = product.image.startsWith("http")
    ? product.image
    : new URL(product.image, SITE_URL).toString();

  return {
    title: `${product.name} | Rima Cosmetics`,
    description: product.description,
    keywords: product.tags,
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      siteName: "Rima Cosmetics",
      type: "website",
      images: [
        {
          url: productImage,
          alt: product.name,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [productImage],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((item) => item.id === params.id) ?? null;
  const relatedProducts = product
    ? products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)
    : [];

  const schema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: [new URL(product.image, SITE_URL).toString()],
        description: product.description,
        sku: product.id,
        brand: {
          "@type": "Brand",
          name: "Rima Cosmetics",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.price.toString(),
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: new URL(`/products/${product.id}`, SITE_URL).toString(),
          seller: {
            "@type": "Organization",
            name: "Rima Cosmetics",
          },
        },
      }
    : null;

  return (
    <>
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
