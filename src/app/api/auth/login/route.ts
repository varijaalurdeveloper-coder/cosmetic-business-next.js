import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.MAILING_LIST_EMAIL;
    const adminPassword = process.env.BUSINESS_OWNER_PASSWORD;

    // Check for admin login first
    if (
      email.trim().toLowerCase() === adminEmail?.toLowerCase() &&
      password === adminPassword
    ) {
      // Admin credential match - create secure session
      const cookieStore = await cookies();
      
      // Create a secure admin session token
      const adminToken = Buffer.from(
        `${email}:${Date.now()}:admin`
      ).toString("base64");
      
      // Set HTTP-only, secure cookie with admin session
      cookieStore.set("admin_session", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: "admin_001",
          email: adminEmail,
          name: "Admin",
          role: "admin",
        },
        isAdmin: true,
        message: "Admin login successful",
      });
    }

    // Otherwise, return error for non-admin login attempt via this endpoint
    // In production, you'd integrate Supabase auth here or use a different endpoint
    return NextResponse.json(
      { error: "Invalid admin credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
