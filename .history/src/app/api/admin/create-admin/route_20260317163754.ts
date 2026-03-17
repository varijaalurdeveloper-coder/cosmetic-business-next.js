import { NextResponse } from "next/server";
import { setupAdmin } from "@/lib/admin/setup-admin";

export async function POST() {
  const result = await setupAdmin();

  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Admin created successfully",
    user: result.user,
  });
}