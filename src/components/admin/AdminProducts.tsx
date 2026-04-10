"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { uploadImage } from "@/lib/supabase/uploadImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
}

export function AdminProducts() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    image_url: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  // ================= FETCH =================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchProducts = async () => {
      try {
        console.log("📡 Fetching products...");

        const res = await fetch("/api/admin/products");

        console.log("📡 Status:", res.status);

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("❌ Non JSON response:", text);
          toast.error("API not returning JSON");
          return;
        }

        console.log("✅ Products API:", data);

        if (!res.ok) {
          toast.error(data.error || "Failed to load products");
          return;
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAdmin]);

  // ================= FORM =================
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "1",
      image_url: "",
    });
    setImagePreview("");
    setSelectedFile(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    console.log("✏️ Input change:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📁 File selected:", file.name);

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    console.log("🔍 Validating form:", formData);

    if (!formData.name.trim()) {
      toast.error("Name required");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Description required");
      return false;
    }

    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Valid price required");
      return false;
    }

    if (Number(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }

    if (!selectedFile && !formData.image_url) {
      toast.error("Image required");
      return false;
    }

    return true;
  };

  // ================= SAVE =================
  const handleSaveProduct = async () => {
    console.log("🚀 Save button clicked");

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (selectedFile) {
        console.log("📤 Uploading image...");
        setIsUploading(true);

        const uploaded = await uploadImage(selectedFile);

        setIsUploading(false);

        console.log("📤 Upload result:", uploaded);

        if (!uploaded) {
          toast.error("Image upload failed");
          return;
        }

        imageUrl = uploaded;
      }

      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        inStock: formData.stock === "1",
        image: imageUrl,
        category: "skin-care",
      };

      console.log("📦 Sending payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ HTML response:", text);
        toast.error("Server returned HTML");
        return;
      }

      console.log("✅ API response:", data);

      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        toast.success("Updated");
      } else {
        setProducts((prev) => [...prev, data.product]);
        toast.success("Product added");
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteProduct = async (id: string) => {
    console.log("🗑 Deleting:", id);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      console.log("🗑 Delete response:", data);

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Fill product details and save
            </DialogDescription>
          </DialogHeader>

          <Input name="name" placeholder="Name" onChange={handleInputChange} />
          <Input name="description" placeholder="Description" onChange={handleInputChange} />
          <Input name="price" placeholder="Price" onChange={handleInputChange} />
          <Input name="image_url" placeholder="Image URL" onChange={handleInputChange} />

          <Input type="file" onChange={handleFileSelect} />

          <Button onClick={handleSaveProduct} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}