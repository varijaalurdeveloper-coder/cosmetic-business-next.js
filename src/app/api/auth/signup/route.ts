// file: /app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 Signup request body:", body);

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // ✅ Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 🔍 Debug env (important)
    console.log("🌐 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // ✅ Signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: `${firstName} ${lastName}`,
          role: "customer",
        },
      },
    });

    console.log("📤 Supabase response:", { data, error });

    // ❌ Handle error
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // ❌ Safety check
    if (!data?.user) {
      return NextResponse.json(
        { error: "User not created" },
        { status: 500 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. You can now log in.",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error("❌ Signup API error:", error);

    return NextResponse.json(
      { error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}