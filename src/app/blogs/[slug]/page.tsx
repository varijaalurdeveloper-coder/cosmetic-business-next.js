"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { allBlogPostsSorted } from "@/lib/data/blog-posts-complete";
import { loadAdminBlogPosts } from "@/lib/local-blog-store";
import { getBlogImageUrl } from "@/utils/blog-images";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/lib/data/blog-posts";

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) {
      setPost(null);
      setLoading(false);
      return;
    }

    const storedPosts = loadAdminBlogPosts();
    const allPosts = new Map<string, BlogPost>();

    allBlogPostsSorted.forEach((entry) => allPosts.set(entry.slug, entry));
    storedPosts.forEach((entry) => allPosts.set(entry.slug, entry));

    setPost(allPosts.get(slug) ?? null);
    setLoading(false);
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf6ef] px-4">
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#eaf6ef] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-[0_8px_24px_rgba(16,24,40,0.08)] text-center">
          <p className="text-xl font-semibold text-gray-900">Blog post not found.</p>
          <p className="mt-3 text-gray-500">It may have been deleted or the slug is invalid.</p>
          <Link href="/blogs">
            <Button className="mt-6">Back to blog list</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf6ef]">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/blogs">
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Blog
                  </Button>
                </Link>
              </div>
              <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                {post.category}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">{post.title}</h1>
              <p className="text-sm text-gray-500">
                <span className="mr-4 inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {post.publishDate}
                </span>
                <span className="mr-4 inline-flex items-center gap-2">
                  <User className="h-4 w-4" /> {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {post.readTime}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
            <div className="h-[420px] w-full bg-[#e5e7eb]">
              <Image
                src={getBlogImageUrl(post.slug)}
                alt={post.title}
                width={1600}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8 sm:p-10">
              <p className="mb-6 text-lg leading-8 text-gray-700">{post.excerpt}</p>
              <div className="space-y-8 text-gray-700">
                <div className="prose max-w-none prose-green">
                  <p>{post.content.introduction}</p>
                </div>

                {post.content.sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900">{section.heading}</h2>
                    <p className="text-base leading-8 text-gray-700">{section.content}</p>
                    {section.subsections?.map((subsection, subIndex) => (
                      <div key={subIndex} className="space-y-2 pl-4">
                        <h3 className="text-xl font-semibold text-gray-900">{subsection.heading}</h3>
                        <p className="text-gray-700">{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Conclusion</h2>
                  <p className="text-base leading-8 text-gray-700">{post.content.conclusion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
