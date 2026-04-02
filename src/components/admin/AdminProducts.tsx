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
import { Product, ProductCategory } from "@/types";
import { Edit2, Trash2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
}

const CATEGORIES: ProductCategory[] = [
  "hair-care",
  "soap",
  "skin-care",
  "lip-care",
];

export function AdminProducts() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch products
  useEffect(() => {
    if (!isAdmin) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.error) {
          toast.error("Failed to load products");
        } else if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAdmin]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      image_url: "",
    });
    setImagePreview("");
    setSelectedFile(null);
  };

  // Handle add product
  const handleOpenAddDialog = () => {
    resetForm();
    setEditingProduct(null);
    setIsAddDialogOpen(true);
  };

  // Handle edit product
  const handleOpenEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.inStock ? "1" : "0",
      image_url: product.image,
    });
    setImagePreview(product.image);
    setEditingProduct(product);
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      image_url: url,
    }));
    setImagePreview(url);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      toast.error("Valid price is required");
      return false;
    }
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required");
      return false;
    }
    return true;
  };

  // Handle save product
  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let imageUrl = formData.image_url;

      // Upload image if a file is selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadedUrl = await uploadImage(selectedFile);
        setIsUploading(false);

        if (!uploadedUrl) {
          toast.error("Failed to upload image. Please try again.");
          setSubmitting(false);
          return;
        }

        imageUrl = uploadedUrl;
      }

      // Validate image URL is provided (either uploaded or manual)
      if (!imageUrl) {
        toast.error("Image URL is required");
        setSubmitting(false);
        return;
      }

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          inStock: formData.stock === "1",
          image: imageUrl,
          category: "skin-care", // Default category - can be made dynamic if needed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save product");
        return;
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        );
        toast.success("Product updated successfully");
        setIsEditDialogOpen(false);
      } else {
        setProducts((prev) => [...prev, data.product]);
        toast.success("Product added successfully");
        setIsAddDialogOpen(false);
      }

      resetForm();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Products</CardTitle>
        <Button onClick={handleOpenAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-8">No products yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-sm truncate">
                      {product.description}
                    </TableCell>
                    <TableCell className="font-semibold">₹{product.price}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditDialog(product)}
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Product Name</Label>
              <Input
                id="add-name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="add-description">Description</Label>
              <textarea
                id="add-description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="add-price">Price (₹)</Label>
              <Input
                id="add-price"
                name="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="add-stock">Stock Status</Label>
              <select
                id="add-stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="1">In Stock</option>
                <option value="0">Out of Stock</option>
              </select>
            </div>

            <div>
              <Label htmlFor="add-image-file">Upload Image</Label>
              <div className="flex gap-2">
                <Input
                  id="add-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <div className="text-xs text-gray-600 self-center">
                    {selectedFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Or paste image URL below (max 5MB)
              </p>
            </div>

            <div>
              <Label htmlFor="add-image">Image URL (optional if uploading)</Label>
              <Input
                id="add-image"
                name="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={handleImageUrlChange}
                disabled={selectedFile ? true : false}
              />
              {imagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                  <p className="text-sm text-gray-600">Preview</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={submitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProduct} 
                disabled={submitting || isUploading}
              >
                {isUploading ? "Uploading..." : submitting ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="edit-stock">Stock Status</Label>
              <select
                id="edit-stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="1">In Stock</option>
                <option value="0">Out of Stock</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-image-file">Upload New Image</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <div className="text-xs text-gray-600 self-center">
                    {selectedFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Or update image URL below (max 5MB)
              </p>
            </div>

            <div>
              <Label htmlFor="edit-image">Image URL (optional if uploading)</Label>
              <Input
                id="edit-image"
                name="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={handleImageUrlChange}
                disabled={selectedFile ? true : false}
              />
              {imagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                  <p className="text-sm text-gray-600">Preview</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={submitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProduct} 
                disabled={submitting || isUploading}
              >
                {isUploading ? "Uploading..." : submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
