"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { finalBlogPosts } from "@/lib/data/blog-posts-final";
import { Calendar, User, Clock } from "lucide-react";

export default function BlogPage() {
  const categories = Array.from(
    new Set(finalBlogPosts.map(post => post.category))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-4">Beauty & Skincare Blog</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Learn about organic skincare, natural ingredients, and beauty tips from our experts.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Info */}
          <div className="mb-12">
            <p className="text-gray-600">
              {finalBlogPosts.length} articles across {categories.length} categories
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {finalBlogPosts.map(post => (
              <Link key={post.id} href={`/blogs/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {/* Featured Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <span className="text-gray-500 text-center px-4">
                      {post.featuredImage}
                    </span>
                  </div>

                  <CardContent className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 line-clamp-2 hover:text-green-600 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.publishDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>

                    {/* Read More Link */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-green-600 hover:text-green-700"
                        asChild
                      >
                        <a href={`/blogs/${post.slug}`}>
                          Read Article →
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {finalBlogPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No blog posts found.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Subscribe for More Beauty Tips</h2>
          <p className="mb-8 text-green-50">
            Get the latest skincare and beauty articles delivered to your inbox.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded text-gray-900"
            />
            <Button
              className="bg-white text-green-600 hover:bg-green-50"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
