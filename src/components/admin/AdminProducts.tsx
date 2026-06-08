"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { uploadImage } from "@/lib/supabase/uploadImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  category: string;
  subcategory: string;
  ingredients: string;
}

const categorySubcategories: Record<string, string[]> = {
  skin: [
    "Dry Skin",
    "Oily Skin",
    "Combination Skin",
    "Sensitive Skin",
    "Acne & Pimples",
    "Acne Scars",
    "Dark Spots / Pigmentation",
    "Tan Removal",
    "Dull Skin",
    "Uneven Skin Tone",
    "Anti-Aging",
    "Fine Lines & Wrinkles",
    "Sun Damage",
    "Open Pores",
    "Redness & Irritation",
  ],
  hair: [
    "Hair Fall",
    "Hair Growth",
    "Dandruff",
    "Dry Hair",
    "Frizzy Hair",
    "Oily Scalp",
    "Split Ends",
    "Damaged Hair",
    "Thin Hair",
    "Curly Hair Care",
    "Scalp Itching",
    "Hair Strengthening",
    "Premature Greying",
    "Hair Shine & Smoothness",
  ],
  lips: [
    "Dry Lips",
    "Chapped Lips",
    "Dark Lips",
    "Lip Pigmentation",
    "Cracked Lips",
    "Lip Brightening",
    "Lip Hydration",
    "Lip Softening",
  ],
  soap: [
    "Dry Skin Soaps",
    "Oily Skin Soaps",
    "Sensitive Skin Soaps",
    "Acne Care Soaps",
    "Charcoal Soaps",
    "Turmeric Soaps",
    "Goat Milk Soaps",
    "Herbal Soaps",
    "Exfoliating Soaps",
    "Moisturizing Soaps",
    "Baby Soaps",
    "Handmade Organic Soaps",
  ],
  "baby-care": [
    "Baby Skin Care",
    "Baby Massage",
    "Baby Dry Skin",
    "Baby Rash Care",
    "Diaper Area Care",
    "Baby Hair Care",
    "Baby Bath Care",
    "Sensitive Baby Skin",
  ],
};

export function AdminProducts() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    category: "skin",
    subcategory: categorySubcategories.skin[0],
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "category") {
        return {
          ...prev,
          category: value,
          subcategory: categorySubcategories[value]?.[0] || "",
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Name & price required");
      return;
    }

    setSubmitting(true);

    try {
      if (!selectedFile) {
        toast.error("Please select a product image file.");
        return;
      }

      const uploaded = await uploadImage(selectedFile);
      if (!uploaded) {
        toast.error("Image upload failed");
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        inStock: formData.stock === "1",
        image: uploaded,
        category: formData.category,
        tags: formData.subcategory ? [formData.subcategory] : [],
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
        category: "skin",
        subcategory: categorySubcategories.skin[0],
        ingredients: "",
      });
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
              <Label htmlFor="product_image">Product Image</Label>
              <input
                id="product_image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Product Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="skin">Skin</option>
                <option value="hair">Hair</option>
                <option value="lips">Lips</option>
                <option value="soap">Soap</option>
                <option value="baby-care">Baby Care</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subcategory">Product Subcategory</Label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {(categorySubcategories[formData.category] || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Input id="ingredients" name="ingredients" placeholder="aloe vera, neem" onChange={handleInputChange} value={formData.ingredients} />
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