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

// ✅ UPDATED FORM TYPE
interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;

  concerns: string;
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

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "1",
    image_url: "",

    concerns: "",
    skin_type: "",
    hair_type: "",
    benefits: "",
    ingredients: "",
  });

  // ================= FETCH =================
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

  // ================= HELPERS =================
  const parseArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  // ================= SAVE =================
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
        category: "skin", // use valid category values for frontend filtering

        // ✅ AI FIELDS
        concerns: parseArray(formData.concerns),
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
        concerns: "",
        skin_type: "",
        hair_type: "",
        benefits: "",
        ingredients: "",
      });
      setSelectedFile(null);
    } catch {
      toast.error("Error saving product");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
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

      {/* ================= DIALOG ================= */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product (AI Optimized)</DialogTitle>
          </DialogHeader>

          <Input name="name" placeholder="Name" onChange={handleInputChange} />
          <Input name="description" placeholder="Description" onChange={handleInputChange} />
          <Input name="price" placeholder="Price" onChange={handleInputChange} />
          <Input name="image_url" placeholder="Image URL" onChange={handleInputChange} />
          <Input type="file" onChange={handleFileSelect} />

          {/* ✅ AI FIELDS */}
          <Input name="concerns" placeholder="Concerns (comma separated)" onChange={handleInputChange} />
          <Input name="skin_type" placeholder="Skin Type (oily, dry...)" onChange={handleInputChange} />
          <Input name="hair_type" placeholder="Hair Type" onChange={handleInputChange} />
          <Input name="benefits" placeholder="Benefits" onChange={handleInputChange} />
          <Input name="ingredients" placeholder="Ingredients" onChange={handleInputChange} />

          <Button onClick={handleSaveProduct} disabled={submitting}>
            {submitting ? "Saving..." : "Save Product"}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}