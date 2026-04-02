import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: "product-images")
 * @returns The public URL of the uploaded image or null on error
 */
export async function uploadImage(
  file: File,
  bucket: string = "product-images"
): Promise<string | null> {
  try {
    // Validate file
    if (!file) {
      toast.error("No file selected");
      return null;
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
      return null;
    }

    // Validate file size (max 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      toast.error("File is too large. Maximum file size is 5MB.");
      return null;
    }

    // Generate unique file name with timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileExtension = file.name.split(".").pop();
    const fileName = `product-${timestamp}-${random}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    if (!publicUrl) {
      toast.error("Failed to get public URL");
      return null;
    }

    toast.success("Image uploaded successfully");
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Failed to upload image");
    return null;
  }
}
