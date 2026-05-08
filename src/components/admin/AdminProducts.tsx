"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { uploadImage } from "@/lib/supabase/uploadImage";
import { concernGroups, type ConcernGroup } from "@/lib/ai/concern-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;

  concernKeywords: string[];
  skin_type: string;
  hair_type: string;
  benefits: string;
  ingredients: string;
}

export function AdminProducts() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [keywordSearch, setKeywordSearch] = useState("");

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    image_url: "",
    concernKeywords: [],
    skin_type: "",
    hair_type: "",
    benefits: "",
    ingredients: "",
  });

  useEffect(() => {
    if (!isAdmin) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error);
          return;
        }

        setProducts(data.products || []);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAdmin]);

  const parseArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const selectedCategory = useMemo(() => {
    const hasHair = formData.concernKeywords.some((keyword) =>
      concernGroups.some(
        (group) => group.category === "hair" && group.keywords.includes(keyword)
      )
    );

    const hasLips = formData.concernKeywords.some((keyword) =>
      concernGroups.some(
        (group) => group.category === "lips" && group.keywords.includes(keyword)
      )
    );

    if (hasHair) return "hair";
    if (hasLips) return "lips";
    return "skin";
  }, [formData.concernKeywords]);

  const filteredKeywordGroups = useMemo(() => {
    const query = keywordSearch.toLowerCase().trim();

    return concernGroups
      .map((group) => ({
        ...group,
        keywords: group.keywords.filter((keyword) =>
          keyword.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.keywords.length > 0);
  }, [keywordSearch]);

  const toggleConcernKeyword = (keyword: string) => {
    setFormData((prev) => {
      const has = prev.concernKeywords.includes(keyword);
      const selected = has
        ? prev.concernKeywords.filter((item) => item !== keyword)
        : [...prev.concernKeywords, keyword];

      return { ...prev, concernKeywords: selected };
    });
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Name & price required");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (selectedFile) {
        const uploaded = await uploadImage(selectedFile);
        if (!uploaded) {
          toast.error("Image upload failed");
          return;
        }
        imageUrl = uploaded;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        inStock: formData.stock === "1",
        image: imageUrl,
        category: selectedCategory,
        concernKeywords: formData.concernKeywords,
        skin_type: parseArray(formData.skin_type),
        hair_type: parseArray(formData.hair_type),
        benefits: parseArray(formData.benefits),
        ingredients: parseArray(formData.ingredients),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setProducts((prev) => [...prev, data.product]);
      toast.success("Product added successfully");
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "1",
        image_url: "",
        concernKeywords: [],
        skin_type: "",
        hair_type: "",
        benefits: "",
        ingredients: "",
      });
      setKeywordSearch("");
      setSelectedFile(null);
    } catch {
      toast.error("Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Deleted");
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>Products</CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Image src={p.image} alt="" width={40} height={40} />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle>Add Product (AI Optimized)</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Name" onChange={handleInputChange} value={formData.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Description" onChange={handleInputChange} value={formData.description} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" placeholder="Price" onChange={handleInputChange} value={formData.price} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">In Stock</Label>
                <Input id="stock" name="stock" placeholder="1 for in stock" onChange={handleInputChange} value={formData.stock} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" name="image_url" placeholder="Image URL" onChange={handleInputChange} value={formData.image_url} />
            </div>

            <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Concern Keywords</p>
                  <p className="text-xs text-muted-foreground">Search and select keywords grouped by category.</p>
                </div>
                <Input
                  placeholder="Search keywords"
                  value={keywordSearch}
                  onChange={(event) => setKeywordSearch(event.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
                {filteredKeywordGroups.map((group) => (
                  <div key={group.groupName}>
                    <div className="mb-2 text-sm font-semibold text-slate-700">{group.groupName}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.keywords.map((keyword) => {
                        const selected = formData.concernKeywords.includes(keyword);
                        return (
                          <label
                            key={keyword}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition ${
                              selected
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-200 bg-white hover:border-emerald-300"
                            }`}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => toggleConcernKeyword(keyword)}
                            />
                            <span className="text-sm">{keyword}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {formData.concernKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.concernKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="skin_type">Skin Type</Label>
                <Input id="skin_type" name="skin_type" placeholder="dry, oily, sensitive" onChange={handleInputChange} value={formData.skin_type} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hair_type">Hair Type</Label>
                <Input id="hair_type" name="hair_type" placeholder="dry, curly, oily" onChange={handleInputChange} value={formData.hair_type} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Input id="benefits" name="benefits" placeholder="moisturizing, brightening" onChange={handleInputChange} value={formData.benefits} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Input id="ingredients" name="ingredients" placeholder="aloe vera, neem" onChange={handleInputChange} value={formData.ingredients} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct} disabled={submitting}>
                {submitting ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}