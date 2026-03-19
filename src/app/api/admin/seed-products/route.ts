export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { seedProducts } from "@/lib/seeds/seed-products";

export async function POST() {
await seedProducts();

return NextResponse.json({
success:true,
message:"Products seeded successfully"
});
}