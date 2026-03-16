"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { finalBlogPosts } from "@/lib/data/blog-posts-final";
import { additionalBlogPosts } from "@/lib/data/blog-posts-additional";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Combine all blog posts and find the matching one
  const allPosts = [...finalBlogPosts, ...additionalBlogPosts];
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blogs">
            <Button className="bg-green-600 hover:bg-green-700">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            {post.content.introduction}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {post.content.sections.map((section, index) => (
            <div key={index}>
              <h2 className="mb-4">{section.heading}</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {section.content}
              </p>

              {/* Subsections */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-8 ml-0 md:ml-6 border-l-2 border-green-200 pl-6">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="mb-3 text-green-700">{subsection.heading}</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {subsection.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Author Bio */}
        <div className="mt-16 p-6 bg-white rounded-lg border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">About {post.author}</h4>
              <p className="text-gray-600 text-sm">
                Skincare expert and founder of Rima Cosmetics. Dedicated to bringing you
                natural, organic beauty solutions and skincare education.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
          <h3 className="mb-4">Want more beauty tips?</h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for weekly skincare advice and product updates.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded border border-gray-300"
            />
            <Button className="bg-green-600 hover:bg-green-700">
              Subscribe
            </Button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allPosts
              .filter(
                p =>
                  p.category === post.category &&
                  p.id !== post.id
              )
              .slice(0, 2)
              .map(relatedPost => (
                <div
                  key={relatedPost.id}
                  className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                >
                  <Link href={`/blogs/${relatedPost.slug}`}>
                    <h3 className="mb-3 line-clamp-2 hover:text-green-600 cursor-pointer">
                      {relatedPost.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="text-sm text-gray-500">
                    {relatedPost.publishDate}
                  </div>
                </div>
              ))}
          </div>

          {allPosts.filter(
            p => p.category === post.category && p.id !== post.id
          ).length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No related articles found.
            </p>
          )}

          <div className="mt-8 text-center">
            <Link href="/blogs">
              <Button variant="outline">View All Articles</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
