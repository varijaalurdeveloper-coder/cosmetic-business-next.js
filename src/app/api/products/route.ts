import { NextResponse } from "next/server";
import { getAllProducts, getStaticProducts } from "@/lib/products/getAllProducts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("❌ PRODUCTS API ERROR:", err);
    const products = getStaticProducts();
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
