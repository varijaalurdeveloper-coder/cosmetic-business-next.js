import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock authentication - in production, verify against actual user database
    const mockUser = {
      id: `user_${Buffer.from(email).toString("base64")}`,
      email,
      name: email.split("@")[0],
      token: Buffer.from(`${email}:${password}`).toString("base64"),
    };

    return NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      },
      token: mockUser.token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
