"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { allBlogPostsSorted } from "@/lib/data/blog-posts-complete";
import { getBlogImageUrl } from "@/utils/blog-images";
import { Search, Calendar, User, Clock, MessageCircle } from "lucide-react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const categories = useMemo(() => {
    return Array.from(new Set(allBlogPostsSorted.map((post) => post.category)));
  }, []);

  const categoryTabs = useMemo(() => {
    return ["All Posts", ...categories];
  }, [categories]);

  const filteredPosts = useMemo(() => {
    return allBlogPostsSorted.filter((post) => {
      const matchesCategory =
        activeCategory === "All Posts" || post.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#eaf6ef]">
      {/* Hero Section */}
      <section className="bg-[#05a126] text-white">
        <div className="mx-auto flex min-h-[360px] max-w-7xl items-center justify-center px-5 py-14 text-center sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="mx-auto max-w-4xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Natural Beauty &amp;
              <br />
              Skincare Blog
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/95 sm:text-xl">
              Expert advice, natural remedies, and organic beauty tips for
              healthy, glowing skin
            </p>
          </div>
        </div>
      </section>

      {/* Search + Categories Section */}
      <section className="-mt-2 px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.08)] sm:p-7">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 w-full rounded-[20px] border-0 bg-[#f3f2f7] pl-14 pr-4 text-lg text-[#1f2937] outline-none ring-0 placeholder:text-[#8b8fa3] focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            {/* Category Grid */}
            <div className="rounded-[24px] bg-[#edf8f1] px-4 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                {categoryTabs.map((category) => {
                  const isActive = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`min-h-[54px] rounded-full px-4 text-center text-base font-medium transition-all sm:text-lg ${
                        isActive
                          ? "bg-[#08c12d] text-white shadow-sm"
                          : "bg-transparent text-[#111827] hover:text-green-700"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 px-1">
            <p className="text-sm text-[#4b5563] sm:text-base">
              {filteredPosts.length} articles
              {activeCategory !== "All Posts" ? ` in ${activeCategory}` : ""} •{" "}
              {categories.length} categories
            </p>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden rounded-[24px] border-0 bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <Link href={`/blogs/${post.slug}`} className="block">
                    <div className="h-56 overflow-hidden bg-[#e5e7eb]">
                      <Image
                        src={getBlogImageUrl(post.slug)}
                        alt={post.title}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4">
                      <span className="inline-flex rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-800">
                        {post.category}
                      </span>
                    </div>

                    <Link href={`/blogs/${post.slug}`}>
                      <h3 className="mb-3 line-clamp-2 text-xl font-semibold leading-snug text-[#111827] transition-colors hover:text-green-700">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-[#6b7280]">
                      {post.excerpt}
                    </p>

                    <div className="mb-5 space-y-2 text-sm text-[#6b7280]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.publishDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[#e5e7eb] pt-4">
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="inline-flex items-center text-sm font-semibold text-[#08a526] transition-colors hover:text-green-700"
                      >
                        Read Article →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
              <p className="text-base text-[#4b5563]">
                No blog posts found for your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-5 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-[#08d64b] text-white shadow-[0_12px_24px_rgba(8,214,75,0.35)] transition-transform duration-200 hover:scale-105"
      >
        <MessageCircle className="h-10 w-10" />
      </a>
    </div>
  );
}