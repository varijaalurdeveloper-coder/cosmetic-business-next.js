import type { Metadata } from "next";

import BlogDetailClient from "../BlogDetailClient";
import { allBlogPostsSorted } from "@/lib/data/blog-posts-complete";
import { getBlogImageUrl } from "@/utils/blog-images";
import { SITE_URL } from "@/lib/seo";

export async function generateStaticParams() {
  return allBlogPostsSorted.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = allBlogPostsSorted.find((entry) => entry.slug === params.slug);

  if (!post) {
    return {
      title: "Blog post not found | Rima Cosmetics",
      description: "This blog post could not be found.",
      alternates: {
        canonical: new URL(`/blogs/${params.slug}`, SITE_URL),
      },
    };
  }

  const imageUrl = getBlogImageUrl(post.slug);

  return {
    title: `${post.title} | Rima Cosmetics`,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: new URL(`/blogs/${post.slug}`, SITE_URL),
      siteName: "Rima Cosmetics",
      type: "article",
      images: [
        {
          url: imageUrl,
          alt: post.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: new URL(`/blogs/${post.slug}`, SITE_URL),
    },
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = allBlogPostsSorted.find((entry) => entry.slug === params.slug) ?? null;

  const schema = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription,
        image: [getBlogImageUrl(post.slug)],
        author: {
          "@type": "Person",
          name: post.author,
        },
        datePublished: post.publishDate,
        url: new URL(`/blogs/${post.slug}`, SITE_URL).toString(),
        publisher: {
          "@type": "Organization",
          name: "Rima Cosmetics",
        },
      }
    : null;

  return (
    <>
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
      <BlogDetailClient slug={params.slug} initialPost={post} />
    </>
  );
}