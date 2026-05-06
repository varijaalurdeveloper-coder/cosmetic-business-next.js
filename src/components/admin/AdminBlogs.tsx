"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { loadAdminBlogPosts, saveAdminBlogPosts } from "@/lib/local-blog-store";
import { BlogPost } from "@/lib/data/blog-posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BLOG_CATEGORIES = [
  "Shopping Guide",
  "Skincare",
  "Skin Treatment",
  "Hair Care",
  "Skincare Education",
  "Luxury Skincare",
  "Home Remedies",
  "Complete Skin Care",
  "Specialized Treatments",
];

interface BlogForm {
  id?: string;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  featuredImage: string;
  excerpt: string;
  introduction: string;
  sectionHeading: string;
  sectionContent: string;
  conclusion: string;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function emptyForm(): BlogForm {
  return {
    slug: "",
    title: "",
    metaDescription: "",
    keywords: "",
    category: BLOG_CATEGORIES[0],
    author: "Admin",
    publishDate: new Date().toISOString().slice(0, 10),
    readTime: "5 min read",
    featuredImage: "",
    excerpt: "",
    introduction: "",
    sectionHeading: "",
    sectionContent: "",
    conclusion: "",
  };
}

export function AdminBlogs() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogForm>(emptyForm());

  useEffect(() => {
    if (!isAdmin) return;

    const stored = loadAdminBlogPosts();
    const normalizedPosts = stored.map((post) => {
      if (typeof post.id !== "string" || !post.id.trim()) {
        return {
          ...post,
          id: String(post.slug || `local-${Date.now()}`),
        };
      }

      return post;
    });

    const needsNormalization = stored.some(
      (post, index) => normalizedPosts[index] !== post
    );

    if (needsNormalization) {
      saveAdminBlogPosts(normalizedPosts);
    }

    setPosts(normalizedPosts);
  }, [isAdmin]);

  const categoryOptions = useMemo(() => BLOG_CATEGORIES, []);

  const resetForm = () => {
    setEditingPost(null);
    setFormData(emptyForm());
  };

  const openDialogForNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      id: post.id,
      slug: post.slug,
      title: post.title,
      metaDescription: post.metaDescription,
      keywords: post.keywords.join(", "),
      category: post.category,
      author: post.author,
      publishDate: post.publishDate,
      readTime: post.readTime,
      featuredImage: post.featuredImage,
      excerpt: post.excerpt,
      introduction: post.content.introduction,
      sectionHeading: post.content.sections?.[0]?.heading || "",
      sectionContent: post.content.sections?.[0]?.content || "",
      conclusion: post.content.conclusion,
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSavePost = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    const slug = normalizeSlug(formData.slug || formData.title);
    if (!slug) {
      toast.error("Please provide a valid slug or title.");
      return;
    }

    const keywords = formData.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const newPost: BlogPost = {
      id: editingPost?.id || crypto.randomUUID?.() || `${Date.now()}`,
      slug,
      title: formData.title,
      metaDescription: formData.metaDescription,
      keywords,
      category: formData.category,
      author: formData.author || "Admin",
      publishDate: formData.publishDate,
      readTime: formData.readTime,
      featuredImage: formData.featuredImage || "",
      excerpt: formData.excerpt,
      content: {
        introduction: formData.introduction,
        sections: formData.sectionHeading || formData.sectionContent ? [
          {
            heading: formData.sectionHeading,
            content: formData.sectionContent,
          },
        ] : [],
        conclusion: formData.conclusion,
      },
    };

    const slugExists = posts.some(
      (post) => post.slug === slug && post.id !== editingPost?.id
    );

    if (slugExists) {
      toast.error("A blog post with this slug already exists.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedPosts = editingPost
        ? posts.map((post) => (post.id === editingPost.id ? newPost : post))
        : [newPost, ...posts];

      setPosts(updatedPosts);
      saveAdminBlogPosts(updatedPosts);
      setIsDialogOpen(false);
      toast.success(editingPost ? "Blog updated" : "Blog created");
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save blog post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = (postId: string, postSlug: string) => {
    const confirmed = window.confirm("Delete this blog post permanently?");
    if (!confirmed) {
      return;
    }

    const updatedPosts = posts.filter(
      (post) => post.id !== postId && post.slug !== postSlug
    );

    setPosts(updatedPosts);
    saveAdminBlogPosts(updatedPosts);

    if (editingPost?.id === postId || editingPost?.slug === postSlug) {
      resetForm();
      setIsDialogOpen(false);
    }

    toast.success("Blog deleted");
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Management</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-gray-600">
          Admin access required.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Blog Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add, edit, and delete admin blog posts with category support.
          </p>
        </div>

        <Button onClick={openDialogForNew} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Blog
        </Button>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
            No admin blog posts yet. Click "Add Blog" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Read Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id ?? post.slug}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>{post.publishDate}</TableCell>
                    <TableCell>{post.readTime}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDialogForEdit(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePost(post.id ?? post.slug, post.slug)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Blog title"
              className="w-full"
            />
            <Input
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="Slug (optional, auto-generated from title)"
              className="w-full"
            />
            <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author"
              />
              <Input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                placeholder="Read time"
              />
              <Input
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                placeholder="Featured image label"
              />
            </div>
            <Textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Excerpt"
              className="min-h-[120px]"
            />
            <Textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              placeholder="Meta description"
              className="min-h-[120px]"
            />
            <Input
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="Keywords, separated by commas"
            />
            <Textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleInputChange}
              placeholder="Introduction"
              className="min-h-[120px]"
            />
            <Input
              name="sectionHeading"
              value={formData.sectionHeading}
              onChange={handleInputChange}
              placeholder="Section heading"
            />
            <Textarea
              name="sectionContent"
              value={formData.sectionContent}
              onChange={handleInputChange}
              placeholder="Section content"
              className="min-h-[120px]"
            />
            <Textarea
              name="conclusion"
              value={formData.conclusion}
              onChange={handleInputChange}
              placeholder="Conclusion"
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={isSaving}>
              {editingPost ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
