import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");

    if (!adminSession) {
      return NextResponse.json({ isAdmin: false });
    }

    // You can add validation here if needed
    return NextResponse.json({
      isAdmin: true,
      user: {
        id: "admin_001",
        email: process.env.MAILING_LIST_EMAIL,
        name: "Admin",
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin session check error:", error);
    return NextResponse.json({ isAdmin: false });
  }
}