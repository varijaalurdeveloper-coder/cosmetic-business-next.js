import type { BlogPost } from "@/lib/data/blog-posts";

const STORAGE_KEY = "rimacosmetics_admin_blog_posts";

export function loadAdminBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load admin blog posts", error);
    return [];
  }
}

export function saveAdminBlogPosts(posts: BlogPost[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error("Failed to save admin blog posts", error);
  }
}
