import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";

export async function GET(req: Request) {
  const id = req.url.split("/").pop();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
